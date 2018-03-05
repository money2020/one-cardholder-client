import * as _       from 'lodash'
import React        from 'react'
import {observer}   from 'mobx-react'
import {observable, reaction, computed} from 'mobx'

import {Button, Header, Icon, Dimmer, List, Image} from 'semantic-ui-react'

import { BrowserRouter, HashRouter, Route, Link } from 'react-router-dom'

var NumberFormat = require('react-number-format');

import FlipMove from 'react-flip-move';

import moment from 'moment';


const CONFIG = {
  API_URL: process.env.API_URL
, USER:    process.env.USER
}

console.log("Config:", CONFIG)


class OneAPI {
  constructor(baseUrl, user) {
    this.baseUrl = baseUrl;
    this.user    = user;
  }
  getRewards() {
    return this.get(`/api/one/rewards?user=${this.user}`);
  }
  getOffers() {
    return this.get('/api/one/offers');
  }
  get(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    return fetch(url, {
      method: 'get',
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then((response) => { return response.json() });
  }
}



class ProfileModel {
  @observable balance   = ""
  @observable firstName = ""
  @observable lastName  = ""
  @observable cardName  = ""

  constructor(store, balance, firstName, lastName, cardName) {
    this.balance   = balance
    this.firstName = firstName
    this.lastName  = lastName

    if (cardName == 'Capital One Mastercardworldcard Points *4734') {
      cardName = 'Capital One - MasterCard World Card'
    }
    this.cardName = `${firstName} ${lastName}`
  }
}



class ProfileStore {
  @observable profile = {}
  @observable loading = false

  constructor(api) {
    this.api = api;
  }

  loadFromServer() {
    const store = this
    store.loading = true
    return this.api.getRewards().then((data) => {
      const balance   = data.rewardsBalance
      const firstName = data.primaryAccountHolder.firstName
      const lastName  = data.primaryAccountHolder.lastName
      const cardName  = data.accountDisplayName
      store.profile = new ProfileModel(store, balance, firstName, lastName, cardName)
      store.loading = false
    })
  }
}




class OfferModel {
  store;
  id;
  @observable icon     = null;
  @observable title    = "title";
  @observable text     = "text";
  @observable color    = "red";
  @observable selected = false;
  @observable expiry   = ""
  @observable redeemed = false

  constructor(store, id, color, icon, title, text, expiry) {
    this.store    = store
    this.id       = id
    this.color    = color
    this.icon     = icon
    this.title    = title
    this.text     = text
    this.selected = false
    this.expiry   = expiry
  }

  select() {
    console.log("Selecting offer:", this)
    this.selected = true
  }

  redeem() {
    console.log("REEDEEMEENG:", this)
    this.redeemed = true
    this.color = {r:'154', g:'205', b:'50'}
    this.icon  = "&#xf00c;"
  }

  static fromJSON(store, json) {
    return new OfferModel(store, json.id, json.color, json.icon, json.title, json.text, json.expiry)
  }
}



class OfferStore {
  @observable offers  = []
  @observable loading = false

  @observable sortField = "id"

  constructor(api) {
    this.api = api;
    setInterval(() => {
      console.log('LOADING!')
      if (this.loading) return
      if (this.hasSelected()) return
      this.loadFromServer()
    }, 1000)
  }

  hasSelected() {
    let result = false
    this.offers.forEach((x) => { result = result || x.selected })
    return result
  }

  removeSelection() {
    this.offers.forEach((x) => { x.selected = false })
    // this.offers = this.sort(this.offers)
  }

  sort(offers) {
    let sort = (offers) => {
      let sortFn = (offer) => {
        if (this.sortField == "id" || this.sortField == "redeemed") {
          return offer.id * -1;
        }
        if (this.sortField == "expiry") {
          let date = moment(offer.expiry, 'MM/DD/YYYY')
          if (!date.isValid()) { return Infinity }
          return date.unix()
        }
      }
      return _.sortBy(offers, sortFn)
    }
    let offersRedeemed  = sort(offers.filter(x =>  x.redeemed))
    let offersAvailable = sort(offers.filter(x => !x.redeemed))
    console.log("Redeemed:", offersRedeemed.length)
    console.log("Available:", offersAvailable.length)
    if (this.sortField == "redeemed") {
      return offersRedeemed
    } else {
      return offersAvailable.concat(offersRedeemed)
    }
  }

  setSortField(field) {
    console.log("Setting sort field:", this.sortField, "->", field)
    this.sortField = field
    this.offers = this.sort(this.offers)
  }

  @computed get selected() {
    let result = null
    this.offers.forEach((x) => {
      if (x.selected) result = x
    })
    return result
  }

  loadFromServer() {
    const store = this
    this.loading = true
    this.api.getOffers().then((data) => {
      console.log("JSON data:", data)
      if (this.hasSelected()) {
        this.loading = false
        return
      }
      let offers = data.map((row) => {
        const title  = row.title
        const text   = row.text
        const id     = row.id
        const icon   = row.icon
        const color  = row.color
        const expiry = row.expiration
        const data   = {id, color, icon, title, text, expiry}
        return OfferModel.fromJSON(store, data);
      });
      const redeemed = _.filter(this.offers, x => x.redeemed).map(x => x.id)
      offers.forEach(x => {
        redeemed.forEach(id => { if (x.id == id) x.redeem() })
      })
      store.offers = this.sort(offers)
      store.loading = false
    }).catch((error) => {
      store.loading = false
      console.error(error)
    });
  }

}


const PointHeader = observer(({profileStore}) => {
  const profile = profileStore.profile
  const style = {
    background: "rgba(255,255,255,0.1)"
  , color:      "white"
  , padding:    "1em 1.3em"
  }
  return (
    <div style={style}>
      <Header as='h2' textAlign='right' dividing size='large' >
        <Icon name='mastercard' />
        <Header.Content inverted>
          <Header.Subheader>{profile.cardName}</Header.Subheader>
          <NumberFormat value={profile.balance} displayType={'text'} thousandSeparator={true} />&nbsp;points available!
        </Header.Content>
      </Header>
    </div>
  )
})


@observer
class OfferDetails extends React.Component {

  render() {
    const {offerStore} = this.props
    let offer = offerStore.selected
    const style = {
      position: 'absolute'
    , top: 0, left: 0, bottom: 0, right: 0
    , zIndex: 90
    , opacity: offer? 1: 0
    , transition: (offer? 'opacity 1s':'opacity 0.4s')
    , pointerEvents: (offer? 'inherit':'none')
    }
    this.html = (x) => { return {__html:x} }
    offer = offer? offer : {}
    const inlineStyle = `
    .category-icon {
      margin: auto;
      width: 60vw;
      height: 60vw;
      margin-top: 10vh;
      border-radius: 50%;
      background: rgba(0,0,0,0.1);
      font-family: FontAwesome;
      font-size: 6.5em;
      text-align: center;
      line-height: 60vw;
      color: rgba(0,0,0,0.8);
      box-shadow: inset 0px 0px 0px 20px rgba(0,0,0,0.1);
    }
    .offer-title, .offer-text {
      text-align: center;
      padding: 0.3em;
    }
    .redeem-button {
      text-align: center;
    }
    .button-container {
      text-align: center;
      position: absolute;
      bottom: 20vw;
      left: 0; right: 0;
    }
    `
    const onClick = () => {
      offerStore.removeSelection()
    }
    const onRedeem = () => {
      offer.redeem()
    }
    return (
      <div style={style}>
        <style>{inlineStyle}</style>
        <div className="category-icon" onClick={onClick} dangerouslySetInnerHTML={this.html(offer.icon)}></div>
        <h1 className="offer-title"dangerouslySetInnerHTML={this.html(offer.title)}></h1>
        <h2 className="offer-text"dangerouslySetInnerHTML={this.html(offer.text)}></h2>
        <div className="button-container"><Button className='redeem-button' size='massive' onClick={onRedeem}>Redeem!</Button></div>
      </div>
    )
  }

}


const ToggleButton = observer(
  ({offerStore, label, curr, sortField}) => {
    const onClick = () => {
      offerStore.setSortField(sortField)
    }
    console.log("Toggle:", label, offerStore.sortField, sortField)
    if (offerStore.sortField == sortField) {
      return (<Button primary>{label}</Button>)
    } else {
      return (<Button onClick={onClick}>{label}</Button>)
    }
})


@observer
class Home extends React.Component {
  render() {
    const {offerStore, profileStore} = this.props
    return (
      <div>
        <PointHeader profileStore={profileStore} />
        <Button.Group fluid>
          <ToggleButton offerStore={offerStore} curr={offerStore.sortField} label='Latest Offers' sortField='id'     />
          <ToggleButton offerStore={offerStore} curr={offerStore.sortField} label='Expiring Soon' sortField='expiry' />
          <ToggleButton offerStore={offerStore} curr={offerStore.sortField} label='Redeemed' sortField='redeemed' />
        </Button.Group>
        <OfferList offerStore={offerStore} />
        <OfferDetails offerStore={offerStore} />
      </div>
    )
  }
}


@observer
class OfferList extends React.Component {

  render() {
    const {offerStore} = this.props;
    const hasSelectedOffers = offerStore.hasSelected()
    const style = {
      overflowY:  hasSelectedOffers ? 'visible' : 'visible'
    , userSelect: 'none'
    }
    const inlineStyle = `
    .list-item.selected .list-icon {
      color: rgba(0,0,0,0);
      transform: scale(80, 80);
      z-index: 9;
      position: relative;
    }
    .list-item:not(.selected) .list-icon {
      transition: transform 0.4s ease;
    }
    .list-item {
      clear: both;
      margin-bottom: 1.3em;
      margin-right: 0.5em;
      padding-bottom: 1.5em;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      min-height: 90px;
      position: relative;
    }
    .floated {
      float: left;
    }
    .list-icon {
      width: 60px;
      height: 60px;
      border-radius: 50em;
      margin-right: 0.6em;
      margin-left: 0.5em;
      line-height: 50px;
      font-size: 2.5em;
      text-align: center;
      position: relative;
      font-family: FontAwesome;
      margin-bottom: 5px;
      margin-top: 10px;
      user-select: none;
      border: 5px solid rgba(0,0,0,0.1);
      display: inline-block;
    }
    .list-icon {
      transition: color 0.1s, transform 1s ease;
    }
    .list-item-header {
      font-size: 1.2em;
      margin-bottom: 0.6em !important;
      margin-top: 0.5em !important;
      color: white !important;
      opacity: 0.6;
    }
    .list-item-subheader {
      font-size: 1.2em;
      color: white !important;
      line-height: 1.4;
    }
    .expiry {
      position: absolute;
      right: 0;
      bottom: 10px;
      color: white;
      opacity: 0.6;
      font-style: italic;
      font-weight: bold;
    }
    .expiry-prefix {
      font-weight: normal;
    }
    `
    return (
    <List inverted relaxed verticalAlign='middle' size='medium' celled style={style} className={'offer-list'}>
      <style>{inlineStyle}</style>
      <FlipMove duration={750} easing="ease-out">
      {offerStore.offers.map( (offer) => (<OfferListItem key={offer.id} offer={offer} />) )}
      </FlipMove>
    </List>
    )
  }
}

@observer
class OfferListItem extends React.Component {

  render() {
    const {offer} = this.props
    const color = offer.color
    this.html = (x) => { return {__html:x} }
    const iconStyle = {
      background: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
    , cursor: 'pointer'
    }
    const onClick = () => {
      const offer = this.props.offer;
      offer.select()
    }
    const className = offer.selected ? 'list-item selected' : 'list-item'
    const style = {
      background: `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
    }
    const inlineStyle = `
    .list-item-text-${offer.id} {
      margin-bottom: 0.2em;
      font-weight: bold;
      color: rgba(${color.r}, ${color.g}, ${color.b}, 0.9) !important
    }
    `
    const classNameText = `list-item-text-${offer.id}`
    return (
      <List.Item key={offer.id} onClick={onClick} style={style} className={className}>
        <style>{inlineStyle}</style>
        <List.Content floated='right'>
          <span className="list-icon" style={iconStyle} dangerouslySetInnerHTML={this.html(offer.icon)}></span>
        </List.Content>
        <List.Content>
          <List.Header className={classNameText} dangerouslySetInnerHTML={this.html(offer.title)}></List.Header>
          <List.Description className='list-item-subheader' dangerouslySetInnerHTML={this.html(offer.text)}></List.Description>
        </List.Content>
        <span className='expiry'><span className='expiry-prefix'>Exp: </span>{offer.expiry}</span>
      </List.Item>
    )
  }

}

const App = observer(() => {
  const api          = new OneAPI(CONFIG.API_URL, CONFIG.USER);
  const offerStore   = new OfferStore(api);
  const profileStore = new ProfileStore(api)
  offerStore.loadFromServer()
  profileStore.loadFromServer()
  return (
    <div style={{height:"100%", width:"100%"}}>
      <Home offerStore={offerStore} profileStore={profileStore} />
    </div>
  )
})


export default () => {
  return (
    <App />
  )
}
