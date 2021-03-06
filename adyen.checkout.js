var AdyenCheckoutHybris = (function () {
    'use strict';
    return {
        oneClickForms: [],
        dobDateFormat: "yy-mm-dd",
        securedFieldsData: {},
        allowedCards: [],
        cseEncryptedForm: null,
        checkout: null,
        card: null,
        oneClickCards: {},

        validateForm: function () {
            var paymentMethod = $( 'input[type=radio][name=paymentMethod]:checked' ).val();

            if(typeof(paymentMethod) == "undefined") {
                window.alert( "Por favor elija una tarjeta" );
                return false;
            }

            if ( paymentMethod === "" ) {
                window.alert( "Por favor elija una tarjeta" );
                return false;
            }

            // Check if it is a valid card and encrypt
            if ( paymentMethod === "adyen_cc" ) {
                if (!this.card.isValid()) {
                    window.alert('La tarjeta seleccionada no es permititda');
                    return false;
                }
                this.copyCardData();
            }

            if (paymentMethod.indexOf( "adyen_oneclick_" ) === 0) {
                var recurringReference = paymentMethod.slice("adyen_oneclick_".length);
                var oneClickCard = this.oneClickCards[recurringReference];

                if (!(oneClickCard && oneClickCard.isValid())) {
                    window.alert('La tarjeta seleccionada no es permititda');
                    return false;
                }
                if ( (oneClickCard.props.type == "bcmc") ) {
                    this.copyOneClickCardDataBCMC( recurringReference )
                }
                else {
                    this.copyOneClickCardData( recurringReference, oneClickCard.state.data.encryptedSecurityCode );
                }
            }

            $( 'input[name="txvariant"]' ).remove();

            return true;
        },

        copyCardData: function() {
            var state = this.card.state.data;
            $( 'input[name="encryptedCardNumber"]' ).val( state.encryptedCardNumber );
            $( 'input[name="encryptedExpiryMonth"]' ).val( state.encryptedExpiryMonth );
            $( 'input[name="encryptedExpiryYear"]' ).val( state.encryptedExpiryYear );
            $( 'input[name="encryptedSecurityCode"]' ).val( state.encryptedSecurityCode );
            $( 'input[name="cardHolder"]' ).val( state.holderName );
        },

        copyOneClickCardData: function ( recurringReference, cvc ) {
            $( "#selectedReference" ).val( recurringReference );
            $( 'input[name="encryptedSecurityCode"]' ).val( cvc );

        },
        copyOneClickCardDataBCMC: function ( recurringReference ) {
            $( "#selectedReference" ).val( recurringReference );
            $( 'input[name="cardBrand"]' ).val( "bcmc" );
        },

        /**
         * Set Custom values for certain payment methods
         */
        setCustomPaymentMethodValues: function () {
            var paymentMethod = $( 'input[type=radio][name=paymentMethod]:checked' ).val();

            var dob = $( '#p_method_adyen_hpp_' + paymentMethod + '_dob' );
            if ( dob ) {
                $( "#dob" ).val( dob.val() );
            }

            var ssn = $( '#p_method_adyen_hpp_' + paymentMethod + '_ssn' );
            if ( ssn ) {
                $( "#socialSecurityNumber" ).val( ssn.val() );
            }
        },

        /**
         * Create DatePicker for Date of Birth field
         *
         * @param element
         */
        createDobDatePicker: function ( element ) {
            $( "." + element ).datepicker( {
                dateFormat: this.dobDateFormat,
                changeMonth: true,
                changeYear: true,
                yearRange: "-120:+0"
            } );
        },


        togglePaymentMethod: function ( paymentMethod ) {
            $( ".payment_method_details" ).hide();
            $( ".chckt-pm__details" ).hide();

            $( "#dd_method_" + paymentMethod ).show();
            $( "#adyen_hpp_" + paymentMethod + "_container" ).show();
        },

        createDfValue: function () {
            window.dfDo( "dfValue" );
        },
        initiateCheckout: function ( locale, loadingContext, originKey ) {
            var translations = {};
            translations[locale] = {"creditCard.holderName.placeholder" : "Nombre"};
            var configuration = {
                locale: locale,// shopper's locale
                loadingContext: loadingContext,
                originKey: originKey,
                translations: translations
            };
            this.checkout = new AdyenCheckout( configuration );
        },


        initiateOneClickCard: function(card) {
            var oneClickCardNode = document.getElementById("one-click-card_" + card.reference);
            var details = [{
                key: "cardDetails.cvc",
                type: "cvc"
            }];

            if(card.type=== "bcmc" )
            {
                details =[];
            }
            var oneClickCard = this.checkout.create('card', {
                details: details,
                storedDetails: {
                    card: {
                        expiryMonth: card.expiryMonth,
                        expiryYear: card.expiryYear,
                        number: card.number
                    }
                },
                type: card.type
            });

            oneClickCard.mount(oneClickCardNode);
            this.oneClickCards[card.reference] = oneClickCard;
        },

        initiateCard: function (allowedCards) {
            this.card = this.checkout.create( 'card', {
                type: 'card',
                hasHolderName: true,
                holderNameRequired: true,
                groupTypes: allowedCards,
                onBinValue: function(bin) {
                    if(bin.binValue.length == 6)
                        searchByBin(bin.binValue);
                }

            });

            this.card.mount(document.getElementById('card-div'));
        },

        initiateIdeal: function (idealDetails) {
            var idealNode = document.getElementById('adyen_hpp_ideal_container');
            var ideal = this.checkout.create('ideal', {
                details: idealDetails, // The array of issuers coming from the /paymentMethods api call
                showImage: true, // Optional, defaults to true
                onChange: handleChange // Gets triggered whenever a user selects a bank// Gets triggered once the state is valid
            });

            function handleChange(event) {
                var issuerIdField = document.getElementById('issuerId');
                var issuerId = event.data.issuer;
                issuerIdField.value = issuerId;
            }

            try {
                ideal.mount(idealNode);
            } catch (e) {
                console.log('Something went wrong trying to mount the iDEAL component: ${e}');
            }
        }
    };
})();
