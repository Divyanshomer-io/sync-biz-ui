// Utility functions for invoice formatting and calculations

// Convert number to Indian currency format
export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Convert number to Indian number format (with commas)
export const formatIndianNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Convert amount to words (Indian format)
export const convertAmountToWords = (amount: number): string => {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  if (amount === 0) return 'Zero Rupees Only';

  const convertGroup = (num: number): string => {
    let result = '';
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  };

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  if (integerPart === 0) {
    if (decimalPart === 0) return 'Zero Rupees Only';
    return `Zero Rupees and ${convertGroup(decimalPart).trim()} Paise Only`;
  }

  let words = '';
  let crores = Math.floor(integerPart / 10000000);
  let lakhs = Math.floor((integerPart % 10000000) / 100000);
  let thousands = Math.floor((integerPart % 100000) / 1000);
  let hundreds = integerPart % 1000;

  if (crores > 0) {
    words += convertGroup(crores) + 'Crore ';
  }
  
  if (lakhs > 0) {
    words += convertGroup(lakhs) + 'Lakh ';
  }
  
  if (thousands > 0) {
    words += convertGroup(thousands) + 'Thousand ';
  }
  
  if (hundreds > 0) {
    words += convertGroup(hundreds);
  }

  words = words.trim() + ' Rupees';

  if (decimalPart > 0) {
    words += ` and ${convertGroup(decimalPart).trim()} Paise`;
  }

  return words + ' Only';
};

// Generate E-way bill compatible JSON
export const generateEwayBillJSON = (invoice: any, customer: any, profile: any) => {
  const ewayBillData = {
    version: "1.0",
    billLists: [
      {
        userGstin: profile?.gst_number || "",
        supplyType: "O", // Outward supply
        subSupplyType: "1", // Supply
        subSupplyDesc: "Others",
        docType: "INV", // Invoice
        docNo: invoice.id,
        docDate: new Date(invoice.invoice_date).toLocaleDateString('en-GB').split('/').reverse().join('/'),
        fromGstin: profile?.gst_number || "",
        fromTrdName: profile?.organization_name || "",
        fromAddr1: profile?.address || "",
        fromAddr2: "",
        fromPlace: "",
        fromPincode: "",
        fromStateCode: "",
        toGstin: customer?.gst_number || "",
        toTrdName: customer?.name || "",
        toAddr1: customer?.address || "",
        toAddr2: "",
        toPlace: "",
        toPincode: "",
        toStateCode: "",
        transactionType: "1", // Regular
        totalValue: invoice.subtotal,
        cgstValue: invoice.gst_amount / 2,
        sgstValue: invoice.gst_amount / 2,
        igstValue: 0,
        cessValue: 0,
        totInvValue: invoice.total_amount,
        transMode: "1", // Road
        transDistance: "0",
        transporterId: "",
        transporterName: invoice.transport_company || "",
        vehicleNo: invoice.truck_number || "",
        vehicleType: "R", // Regular
        itemList: invoice.items?.map((item: any, index: number) => ({
          slNo: (index + 1).toString(),
          prdDesc: item.item_name || item.name,
          isService: "N",
          hsnCd: "0000", // Default HSN code - should be updated based on actual product
          qty: item.quantity,
          unit: item.unit,
          unitPrice: item.rate_per_unit || item.rate,
          totAmt: item.amount,
          discount: 0,
          preValAdval1: 0,
          assessableVal: item.amount,
          cgstRate: invoice.gst_percentage / 2,
          cgstAmt: (item.amount * invoice.gst_percentage) / 200,
          sgstRate: invoice.gst_percentage / 2,
          sgstAmt: (item.amount * invoice.gst_percentage) / 200,
          igstRate: 0,
          igstAmt: 0,
          cessRate: 0,
          cessAmt: 0,
          cessNonadvol: 0,
          stateCessRate: 0,
          stateCessAmt: 0,
          stateCessNonadvol: 0,
          otherValue: 0,
          totItemVal: item.amount + (item.amount * invoice.gst_percentage) / 100
        })) || []
      }
    ]
  };

  return ewayBillData;
};

// Format date for Indian context
export const formatIndianDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Calculate GST breakdown (CGST/SGST for intra-state, IGST for inter-state)
export const calculateGSTBreakdown = (amount: number, gstRate: number, isInterState: boolean = false) => {
  const gstAmount = (amount * gstRate) / 100;
  
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total: gstAmount
    };
  }
  
  return {
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
    igst: 0,
    total: gstAmount
  };
};