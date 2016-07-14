'use strict';

var Flowers = require('./Flowers.js')
  , FlowersUser = Flowers.FlowersUser
  , Product = require('./Product.js')
  , Purchase = require('./Purchase.js')
  , config = require('../config')
  , _ = require('lodash')
  , moment = require('moment')
  , Promise = require('bluebird')
  , verbose = config.verbose
  , ContactBook = require('./ContactBook.js')
  , Catalog = require('./Catalog.js')
  , address = require('../skill/address.js')
  , alexaFlowers = require('./alexa-flowers.js')
;

/* TERMS
 * possibleRecipient: The name of a person the user wants to send flowers to. It's not yet validated. Always a string or null
 * recipientChoice: An offering to the user of a name that they could say. When the user says the name, it'll be a
 *                  possibleRecipient, then validated
 * contactCandidates: When the user gives us a possible recipient, and we're validating, we pick all the contacts that
 *                   are close to the possibleRecipient. Each of these is a contactCandidate.
 * recipient: The actual recipient that has been selected and validated by the user to send flowers to. This is the real deal.
 * arrangementDescriptionOffset: When the user ask us for the arrangement's descriptions, we keep track of the current
                                 arrangement offset
 * arrangement: The actual arrangement that has been selected by the user.
 * sizeDescriptionOffset: When user ask us for size's descriptions, we keep track of the current  arrangement offset
 */

// Mostly used for testing
exports.fromData = function (api, data) {
  return new PartialOrder(api || {}, data);
};

// Builds the PO from state stored in the session
exports.fromRequest = function (api, request) {
  //console.log('Initializing po from request');
  return new PartialOrder(api, request.session.attributes.partialOrder);
};

// Makes a new PO with nothing in it
exports.empty = function (api) {
  return new PartialOrder(api, {});
};

// Check if an PO is open
exports.exists = function (request) {
  return !!(request.session && request.session.attributes && request.session.attributes.partialOrder);
}

/**
 * q: { } set of promises that are getting data :), such as:
 *    - product
 */
function PartialOrder(api, data) {
  data = data || {};
  this.q = {};
  _.assign(this, api);
  _.assign(this, data);
  if(data.contactBook) this.contactBook = ContactBook.fromData(api,data.contactBook);
}

PartialOrder.prototype.serialize = function () {
  var ret = _.omit(this, 'user', 'q', 'pruned', 'user', 'flowers', 'analytics');
  if (ret.history) delete ret.history.lastPull;
  if (ret.items) _.forEach(ret.items, function (item) {
    delete item.q;
  });
  if(ret.contactBook) ret.contactBook = ret.contactBook.serialize();
  return ret;
};

PartialOrder.prototype.getContactBook = function() {
  var self = this;
  if(self.contactBook) return Promise.resolve(self.contactBook);
  return self.q.contactBook = (self.q.contactBook || self.user.getRecipients(self.user.customerID).then(function(contacts){
    self.contactBook = ContactBook.fromContacts({user: self.user, flowers: self.flowers},contacts);
    return self.contactBook;
  }));
}

PartialOrder.prototype.hasRecipient = function() {
  return !!this.recipient;
}

PartialOrder.prototype.hasPaymentMethod = function() {
  var self = this;
  if(self.hasPM) return Promise.resolve(self.hasPM);
  return self.q.hasPM = (self.q.hasPM || self.user.getPaymentMethods().then(function(cards) {
    self.hasPM = cards.length > 0;
    return self.hasPM;
  }));
}

PartialOrder.prototype.getRecipientAddress = function() {
  return address.fromPipes(this.recipient.address);
}
//
/// ***** Recipient Choices ***** ///
// These are unique names in the user's contact book that we mention to the user
// as a prompt for who to tell us to select

PartialOrder.prototype.setupRecipientChoices = function() {
  return this.recipientChoices = {
    offset: 0,
    choices: this.contactBook.range(0,config.skill.recipientChoiceCount),
  };
}

PartialOrder.prototype.getRecipientChoices = function() {
  return this.recipientChoices.choices;
}

PartialOrder.prototype.nextRecipientChoices = function() {
  this.recipientChoices.offset += config.skill.recipientChoiceCount;
  this.recipientChoices.choices = this.contactBook.range(this.recipientChoices.offset,config.skill.recipientChoiceCount);
}

PartialOrder.prototype.isLastRecipientChoiceOffer = function() {
  return this.recipientChoices.offset + config.skill.recipientChoiceCount >= this.contactBook.contacts.length;
}

/// ***** Contact Candidates ***** ///
// These are contacts (Names & Addresses) that match the user's queries. We offer them to the user in a
// series, and they pick one that will become the final recipient.

PartialOrder.prototype.setupContactCandidates = function() {
  this.contactCandidates = {
    offset: 0,
    choices: this.contactBook.searchByName(this.possibleRecipient)
  };
}

PartialOrder.prototype.hasContactCandidate = function() {
  return this.contactCandidates && this.contactCandidates.offset < this.contactCandidates.choices.length;
}

PartialOrder.prototype.nextContactCandidate = function() {
  return this.contactCandidates.offset++;
}

PartialOrder.prototype.getContactCandidate = function() {
  return this.contactCandidates.choices[this.contactCandidates.offset];
}

PartialOrder.prototype.acceptCandidateContact = function() {
  this.recipient = this.getContactCandidate();
  //Clear out this junk just to make the session smaller
  this.possibleRecipient = null;
  this.contactCandidates = null;
  this.recipientChoices = null;
}

PartialOrder.prototype.isContactCandidateDeliverable = function() {
  return address.isDeliverable(address.fromPipes(this.getContactCandidate().address));
}

/// ***** Arrangement Descriptions ***** ///
/// These are the arrangement (Name & Description) that user can order. We describe them to the user
/// in a series, and they can pick one that will become the final arrangement, or we just
/// let them say the name of the arrangement directly.

PartialOrder.prototype.setupArrangementDescriptions = function(name) {
  var index = 0;
  if (name) index = Catalog.indexByName(name);
  this.arrangementDescriptionOffset = index;
}

PartialOrder.prototype.hasArrangementDescription = function() {
  return this.arrangementDescriptionOffset && this.arrangementDescriptionOffset < Catalog.choices.length;
}

PartialOrder.prototype.nextArrangementDescription = function() {
  return this.arrangementDescriptionOffset++;
}

PartialOrder.prototype.getArrangementDescription = function() {
  return Catalog.choices[this.arrangementDescriptionOffset];
}

PartialOrder.prototype.clearArrangementDescriptions = function() {
  //Clear out this junk just to make the session smaller
  this.arrangementDescriptionOffset = null;
}

PartialOrder.prototype.pickArrangement = function(arrangementName) {
  if (verbose) console.log('PickArrangement ' + arrangementName);
  var self = this;
  if (!arrangementName) {
    self.arrangement = null;
    return Promise.resolve(null);
  }
  var entry = Catalog.findByName(arrangementName);
  self.arrangement =_.pick(entry,['name','sku']);
  return self.getArrangementDetails().then(function (details) {
    if (verbose) console.log(JSON.stringify(details));
    var isValid =  details.items && details.items.length;
    if(!isValid) self.arrangement = null;
    return self.arrangement;
  });
}

PartialOrder.prototype.hasArrangement = function() {
  return !!this.arrangement;
}

/// ***** Size Descriptions ***** ///
/// These are the sizes (Name & Description) that user can order for the specific arrangement.
/// We describe them to the user in series, and they can pick one that will become the final size,
/// or the user can just pick the one they want directly.

PartialOrder.prototype.setupSizeDescriptions = function(name) {
  var index = 0;
  if (name) index = this.sizeIndexByName(name);
  this.sizeDescriptionOffset = index;
}

PartialOrder.prototype.hasSizeDescription = function() {
  return this.sizeDescriptionOffset && this.sizeDescriptionOffset < this.getSizeDetails().length;
}

PartialOrder.prototype.nextSizeDescription = function() {
  return this.sizeDescriptionOffset++;
}

PartialOrder.prototype.getSizeDescription = function() {
  return this.getSizeDetails()[this.sizeDescriptionOffset];
}

PartialOrder.prototype.clearSizeDescriptions = function() {
  // Clear out this junk just to make the session smaller
  this.sizeDescriptionOffset = null;
}

PartialOrder.prototype.pickSize = function(sizeName) {
  this.size = sizeName;
}

PartialOrder.prototype.hasSize = function() {
  return !!this.size;
}

PartialOrder.prototype.getSizeDetails = function(name) {
  return Catalog.findByName(name || this.arrangement.name).sizes;
}

PartialOrder.prototype.sizeIndexByName = function(name) {
  var self = this
      , sizes = self.getSizeDetails()
  ;
  return _(sizes)
    .map(function(entry) {
      return entry.name.toLowerCase();
    })
    .indexOf(name.toLowerCase());
}

PartialOrder.prototype.getSizeByName = function(name) {
  var self = this
      , sizes = self.getSizeDetails()
  ;
  var val = _(sizes).find(function (entry) {
    return entry.name.toLowerCase() == name.toLowerCase();
  });
  if(val) val.sku = val.sku || self.arrangement.sku + val.suffix;
  return val;
}

PartialOrder.prototype.getSizeDetailsByName = function (name) {
  var self = this;
  name = name || self.size;
  var size = self.getSizeByName(name);
  return _.find(self.arrangement.details.items,function(item){ return item.sku == size.sku });
}

PartialOrder.prototype.getSizeName = function() {
  return this.size;
}

// Cache products
PartialOrder.prototype.getArrangementDetails = function(arrangement) {
  var self = this
    , arrangement = arrangement || self.arrangement;

  if(arrangement.details) return Promise.resolve(arrangement.details);
  self.q.products = self.q.products || {};
  return self.q.products[arrangement.sku] = self.q.products[arrangement.sku] || Promise.try(function () {
    return Product(config.flowers, arrangement.sku).getProductDetails().then(function (details) {
      arrangement.details = {
        prodType: details.product.prodType,
        items: _.map(details.product.skuList.sku,function(item){
          return {
            sku: item.productSku,
            price: item.skuOfferPrice
          };
        })
      };
      return arrangement.details;
    });
  });
}

PartialOrder.prototype.getProduct = function() {
  var self = this;
  var size = self.getSizeByName(self.size);
  return Product(config.flowers,size.sku);
}

/// ***** Delivery Date ***** ///

PartialOrder.prototype.hasDeliveryDate = function() {
  return !!this.deliveryDate;
}

PartialOrder.prototype.acceptPossibleDeliveryDate = function(date) {
  var self = this
    , mDate = moment(date || self.possibleDeliveryDate) //It's already been validated
  ;
  self.deliveryDate = mDate.toISOString();
}

PartialOrder.prototype.isDateDeliverable = function(date, product) {
  var self = this;
  return Promise.try(function(){
    var mDate = moment(date);
    // No past deliver dates allowed, but TZs are tricky, to fudge a day and let the API handle TZs.
    if(!date || !mDate.isValid || mDate.isBefore(moment().add(-1,'day'))) return false;
    product = product || self.getProduct();
    return product.getDeliveryCalendar(self.getRecipientAddress().zip,null,mDate.toISOString())
    .then(function(res){
      return res.getDlvrCalResponse.responseStatus == 'SUCCESS';
    })
  });
}

PartialOrder.prototype.findDeliveryDateOffers = function(date) {
  var self = this;
  return Promise.try(function(){
    var mDate = moment(date)
      , product = self.getProduct()
      , options = [];
    if(!mDate.isValid || mDate.isBefore(moment().add(-1,'day'))) options = [moment().add(1,'day'),moment().add(2,'day')];
    else options = [moment(mDate).add(-1,'day'), moment(mDate).add(1,'day')];
    if(verbose) console.log('Offering alternative dates: ', options.map(function(d){ return d.format('YYYY-MM-DD'); }))

    return Promise.all(options.map(function(date){ return self.isDateDeliverable(date,product); }))
    .then(function(valids){
      self.deliveryDateOffers = _(options)
        .zip(valids)
        .filter('1')
        .map(function(d){ return d[0].toISOString(); })
        .value();
      return self.deliveryDateOffers;
    });
  });
}

PartialOrder.prototype.prepOrderForPlacement = function(){
  // 0. Get Product prices
  // 1. Get Recipient Address
  // 2. Get Shipping prices
  // 3. Get Tax information
  // 4. Aggregate prices
  // 5. Select payment method
  var self = this
    , purchase = Purchase(config.flowers)
    , item = self.getSizeDetailsByName()
  ;
  return Promise.all([
    self.user.getRecipientAddress(self.recipient.demoId,self.recipient.id),
    self.user.getPaymentMethods()
  ])
  .spread(function(address, cards){
    self.order = {
      address: address,
      card: alexaFlowers.pickCard(cards),
      charges: null
    };
    return purchase.getShipping({
      productSku: item.sku,
      prodType: self.arrangement.details.prodType,
      itemPrice: item.price,
    },address,self.deliveryDate);
  }).then(function(shipping){
    var charges = self.order.charges  = {
      item: +item.price,
      shippingBase: +shipping[0].baseCharge,
      surcharge: +shipping[0].totSurcharge,
      upcharge: +shipping[0].upCharge,
    };
    charges.shippingTotal = charges.shippingBase + charges.surcharge + charges.upcharge;
    charges.total = charges.item + charges.shippingTotal;
  })
  .then(function(){
    return purchase.getTaxes(item.sku, self.order.address.postalCode, item.price, self.order.charges.shippingTotal.toString());
  }).then(function(txs){
    self.order.charges.taxes = +txs;
    self.order.charges.total +=  +txs;
  }).then(function(){
     return !!self.order && self.order.card && self.order.charges.total;
  });
}

PartialOrder.prototype.placeOrder = function() {
  //-1. Get User Address
  //0. Get order Number
  //1. Authorize CC
  //2. create order
  var self = this
    , item = self.getSizeDetailsByName()
    , product = {
      tax: self.order.charges.taxes
      , shipping: self.order.charges.shippingTotal
      , sku: item.sku
      , name: item.name
      , price: self.order.charges.item
      , deliveryDate: self.deliveryDate
      , total: self.order.charges.total
    }
    , recipient = {
      firstName: self.order.address.firstName
      , lastName: self.order.address.lastName
      , addr1: self.order.address.addr1
      , addr2: self.order.address.addr2
      , city: self.order.address.city
      , state: self.order.address.state
      , postalCode: self.order.address.postalCode
      , country: self.order.address.country
      , phone: self.order.address.phone
    }
    , payment = self.order.card
  ;
  
  return self.user.submitOrder(product, recipient, self.order.card)
    .then(function(status) {
      return !!status.message;
    })
  ;
}

// Get the web url
PartialOrder.prototype.getWeb = function() {
  return config.flowers.web;
}
