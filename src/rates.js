const RENTAL_RATES = {
    small: {
      rate_100: 46.95,
      rate_200: 59.95,
      facility_fee: 14.0,
      insurance: 29.99,
      tax_rate: 0.1,
      deposit: {
        in_state: 250.0,
        out_of_state: 500.0,
      },
    },
    midsize: {
      rate_100: 51.95,
      rate_200: 63.95,
      facility_fee: 14.0,
      insurance: 29.99,
      tax_rate: 0.1,
      deposit: {
        in_state: 250.0,
        out_of_state: 500.0,
      },
    },
    fullsize: {
      rate_100: 57.95,
      rate_200: 69.95,
      facility_fee: 14.0,
      insurance: 39.99,
      tax_rate: 0.1,
      deposit: {
        in_state: 250.0,
        out_of_state: 500.0,
      },
    },
    minivan: {
      rate_100: 104.95,
      rate_200: 117.95,
      facility_fee: 14.0,
      insurance: 39.99,
      tax_rate: 0.1,
      deposit: {
        in_state: 250.0,
        out_of_state: 500.0,
      },
    },
    "passenger-van": {
      rate_100: null,
      rate_200: 199.95,
      facility_fee: 14.0,
      insurance: 39.99,
      tax_rate: 0.1,
      deposit: {
        in_state: 250.0,
        out_of_state: 500.0,
      },
    },
  };
  
  function calculateQuote(
    vehicleType,
    mileageOption,
    needsInsurance,
    numDays = 1
  ) {
    const rates = RENTAL_RATES[vehicleType];
    if (!rates) return null;
  
    const rate = mileageOption === "100" ? rates.rate_100 : rates.rate_200;
    if (rate === null) return null;
  
    const dailyRate = rate;
    const totalRentalCost = dailyRate * numDays;
    const insurance = needsInsurance ? rates.insurance * numDays : 0;
    const subtotal = totalRentalCost + rates.facility_fee + insurance;
    const tax = subtotal * rates.tax_rate;
    const total = subtotal + tax;
  
    return {
      base_rate: rate,
      facility_fee: rates.facility_fee,
      insurance: needsInsurance ? rates.insurance : 0,
      subtotal: subtotal,
      tax: tax,
      total: total,
      deposit: {
        in_state: rates.deposit.in_state,
        out_of_state: rates.deposit.out_of_state,
      },
    };
  }
  