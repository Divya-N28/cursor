# Edge Cases for Payment Processor

This document lists and describes edge cases considered for the payment processing logic.

## 1. Invalid Input Types
- **Amount is not a number:** e.g., string, null, undefined, NaN, Infinity
- **User balance is not a number:** e.g., string, null, NaN, Infinity
- **User ID is missing or not a string:** e.g., undefined, null, number, empty string

## 2. Invalid Amounts
- **Amount is zero**
- **Amount is negative**
- **Amount is extremely large (overflow/precision)**

## 3. Currency Issues
- **Unsupported currency:** e.g., 'JPY', 'INR'
- **Currency is lowercase or mixed case:** e.g., 'usd', 'Usd'
- **Currency is null or undefined**

## 4. Balance Issues
- **User balance is less than amount (insufficient funds)**
- **User balance is negative**
- **User balance is NaN or Infinity**

## 5. Fraud Detection
- **More than 3 payments over $5000 (USD equivalent) in 24 hours for a user**
- **Exactly 3 large payments, then a small one (should not trigger fraud)**
- **4 small payments, then a large one (should not trigger fraud)**
- **4 large payments, but over 24 hours (should not trigger fraud)**

## 6. Third-Party API Issues
- **Payment gateway randomly fails (simulated error)**
- **Payment gateway declines large amounts (over $10,000)**
- **Payment gateway is slow (simulated latency or timeout)**
- **Payment gateway returns unexpected response (e.g., missing fields)**

## 7. Concurrency/Locking
- **Two simultaneous payment requests for the same user (should lock and reject the second)**
- **Two requests for different users at the same time (both should be processed)**

## 8. Edge Parameter Cases
- **All parameters missing**
- **Extra, unexpected parameters in the request**

## 9. Floating Point/Precision
- **Amount is a floating-point number with many decimals**

## 10. Currency Conversion Boundaries
- **Amount in EUR or GBP that, when converted, is just over $5000 (fraud detection boundary)**
- **Amount in EUR or GBP that, when converted, is just under $5000**

---

**Note:** The normal success path (valid payment with all correct parameters) is not an edge case, but is always tested as a baseline to ensure the function works as expected under normal conditions. 