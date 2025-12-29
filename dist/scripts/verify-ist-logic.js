"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const now = new Date();
const istTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
const istTime = new Date(istTimeStr);
console.log('System Time:', now.toString());
console.log('System ISO:', now.toISOString());
console.log('IST Time String:', istTimeStr);
console.log('IST Date object:', istTime.toString());
console.log('IST Hours:', istTime.getHours());
console.log('IST Minutes:', istTime.getMinutes());
const currentHours = istTime.getHours();
const currentMinutes = istTime.getMinutes();
const currentTimeValue = currentHours * 60 + currentMinutes;
console.log('Current Time Value (minutes since midnight IST):', currentTimeValue);
//# sourceMappingURL=verify-ist-logic.js.map