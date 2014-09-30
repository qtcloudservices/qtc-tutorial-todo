/*
 * SAMPLE CONFIGURATION FILE
 *
 * IMPORTANT! COPY THIS FILE AS qtc-conf.js AND REPLACE THE VALUES BELOW TO MATCH YOUR EDS CONFIG
 *
 */

module.exports = {

    eds: {
        address: "YOUR ADDRESS HERE",           // Replace with your EDS address
        backendId: "YOUR BACKED ID HERE",       // Replace with your backendId
        secret: "YOUR INSTANCE SECRET HERE"     // Replace with your instance secret
    },

   mws: {
        address: "YOUR MWS INSTANCE ADDRESS",           // Replace with your mws address here
        gatewayId: "YOUR MWS INSTANCE GATEWAY ID",      // Replace with your mws gateway id here
        secret: "YOUR MWS INSTANCE SECURITY TOKEN"      // Replace with your mws security token here
    }
};
