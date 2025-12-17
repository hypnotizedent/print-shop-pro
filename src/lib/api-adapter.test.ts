/**
 * API Adapter Tests
 * 
 * Run these tests to verify the adapter transforms data correctly.
 * 
 * Usage:
 * 1. Import into a test page or run in browser console
 * 2. Compare outputs with expected Spark types
 */

import {
  transformCustomer,
  transformQuote,
  transformJob,
  transformLineItem,
  type APICustomer,
  type APIQuote,
  type APIJob,
} from './api-adapter'

// ============================================================================
// Sample API Responses (Printavo-style)
// ============================================================================

const sampleAPICustomer: APICustomer = {
  id: 12345,
  first_name: 'John',
  last_name: 'Smith',
  company: 'Acme Corp',
  email: 'john@acmecorp.com',
  phone: '555-123-4567',
  tax_exempt: false,
  tax_resale_num: null,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-06-20T14:22:00Z',
  address_1: '123 Main Street',
  address_2: 'Suite 100',
  city: 'Miami',
  state: 'FL',
  zip: '33101',
  country: 'US',
}

const sampleAPIQuote: APIQuote = {
  id: 67890,
  visual_id: 'Q-2024-0042',
  nickname: 'Acme Summer Event',
  customer_id: 12345,
  customer: sampleAPICustomer,
  orderstatus_id: 2,
  orderstatus: {
    id: 2,
    name: 'Sent',
    color: '#3498db',
  },
  lineitems: [
    {
      id: 1001,
      style_number: 'G500',
      style_description: 'Gildan Heavy Cotton T-Shirt',
      color: 'Black',
      quantity: 100,
      unit_cost: '8.50',
      taxable: true,
      position: 1,
      lineitemgroup_id: 501,
      imprint_id: 201,
      xs: 5,
      s: 15,
      m: 30,
      l: 30,
      xl: 15,
      '2xl': 5,
    },
    {
      id: 1002,
      style_number: 'PC61',
      style_description: 'Port & Company Essential Tee',
      color: 'Navy',
      quantity: 50,
      unit_cost: '7.00',
      taxable: true,
      position: 2,
      lineitemgroup_id: 501,
      imprint_id: 201,
      s: 10,
      m: 15,
      l: 15,
      xl: 10,
    },
  ],
  lineitemgroups: [
    {
      id: 501,
      name: 'Front Print',
      description: 'Full front chest print',
      position: 1,
    },
  ],
  imprints: [
    {
      id: 201,
      name: 'Screen Print - Front',
      description: '3 color front print',
      print_location: 'Front',
      number_of_colors: 3,
      setup_fee: '45.00',
      additional_fee: '0.50',
    },
  ],
  payments: [
    {
      id: 301,
      amount: '500.00',
      payment_type: 'Venmo',
      reference: '@acmecorp',
      notes: '50% deposit',
      created_at: '2024-06-01T09:00:00Z',
    },
  ],
  subtotal: '1200.00',
  discount: '10',
  discount_as_percentage: true,
  tax: '75.60',
  total: '1155.60',
  customer_note: 'Please deliver by June 15th',
  production_note: 'Use soft-hand ink',
  due_date: '2024-06-15',
  created_at: '2024-05-20T08:00:00Z',
  updated_at: '2024-05-25T16:30:00Z',
  expires_at: '2024-06-20',
}

const sampleAPIJob: APIJob = {
  id: 11111,
  visual_id: 'J-2024-0038',
  nickname: 'Acme Summer Event',
  customer_id: 12345,
  customer: sampleAPICustomer,
  orderstatus_id: 5,
  orderstatus: {
    id: 5,
    name: 'In Production',
    color: '#f39c12',
  },
  lineitems: sampleAPIQuote.lineitems,
  lineitemgroups: sampleAPIQuote.lineitemgroups,
  imprints: sampleAPIQuote.imprints,
  payments: sampleAPIQuote.payments,
  subtotal: '1200.00',
  discount: '10',
  discount_as_percentage: true,
  tax: '75.60',
  total: '1155.60',
  customer_note: 'Please deliver by June 15th',
  production_note: 'Use soft-hand ink',
  due_date: '2024-06-15',
  ship_date: '2024-06-14',
  created_at: '2024-05-25T10:00:00Z',
  updated_at: '2024-06-10T11:45:00Z',
  quote_id: 67890,
}

// ============================================================================
// Test Functions
// ============================================================================

export function testCustomerTransform() {
  console.group('🧪 Customer Transform Test')
  
  const result = transformCustomer(sampleAPICustomer)
  
  console.log('Input (API):', sampleAPICustomer)
  console.log('Output (Spark):', result)
  
  // Assertions
  const tests = [
    ['ID format', result.id === 'c-12345'],
    ['Name combined', result.name === 'John Smith'],
    ['Email', result.email === 'john@acmecorp.com'],
    ['Company', result.company === 'Acme Corp'],
    ['Phone', result.phone === '555-123-4567'],
    ['Address street', result.address?.street === '123 Main Street, Suite 100'],
    ['Address city', result.address?.city === 'Miami'],
    ['Address state', result.address?.state === 'FL'],
    ['Tax exempt', result.taxExempt === false],
    ['Has email preferences', !!result.emailPreferences],
  ]
  
  tests.forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`)
  })
  
  console.groupEnd()
  return tests.every(([, passed]) => passed)
}

export function testQuoteTransform() {
  console.group('🧪 Quote Transform Test')
  
  const result = transformQuote(sampleAPIQuote)
  
  console.log('Input (API):', sampleAPIQuote)
  console.log('Output (Spark):', result)
  
  const tests = [
    ['ID format', result.id === 'q-67890'],
    ['Quote number', result.quote_number === 'Q-2024-0042'],
    ['Nickname', result.nickname === 'Acme Summer Event'],
    ['Status mapped', result.status === 'sent'],
    ['Customer transformed', result.customer.id === 'c-12345'],
    ['Line items count', result.line_items.length === 2],
    ['Line item 1 ID', result.line_items[0].id === 'li-1001'],
    ['Line item 1 name', result.line_items[0].product_name === 'Gildan Heavy Cotton T-Shirt'],
    ['Line item 1 SKU', result.line_items[0].product_sku === 'G500'],
    ['Line item 1 color', result.line_items[0].product_color === 'Black'],
    ['Line item 1 sizes.M', result.line_items[0].sizes.M === 30],
    ['Line item 1 decoration', result.line_items[0].decoration === 'screen-print'],
    ['Discount type', result.discount_type === 'percent'],
    ['Has payments', result.payments && result.payments.length === 1],
    ['Payment method', result.payments?.[0]?.method === 'venmo'],
    ['Notes customer', result.notes_customer === 'Please deliver by June 15th'],
    ['Notes internal', result.notes_internal === 'Use soft-hand ink'],
  ]
  
  tests.forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`)
  })
  
  console.groupEnd()
  return tests.every(([, passed]) => passed)
}

export function testJobTransform() {
  console.group('🧪 Job Transform Test')
  
  const result = transformJob(sampleAPIJob)
  
  console.log('Input (API):', sampleAPIJob)
  console.log('Output (Spark):', result)
  
  const tests = [
    ['ID format', result.id === 'j-11111'],
    ['Job number', result.job_number === 'J-2024-0038'],
    ['Quote ID reference', result.quote_id === 'q-67890'],
    ['Status mapped', result.status === 'printing'],
    ['Progress calculated', result.progress === 50],
    ['Artwork approved', result.artwork_approved === true],
    ['Ship date', result.ship_date === '2024-06-14'],
    ['Production notes', result.production_notes === 'Use soft-hand ink'],
    ['Customer ID', result.customer.id === 'c-12345'],
    ['Line items preserved', result.line_items.length === 2],
  ]
  
  tests.forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`)
  })
  
  console.groupEnd()
  return tests.every(([, passed]) => passed)
}

export function testStatusMappings() {
  console.group('🧪 Status Mapping Tests')
  
  const quoteStatusTests = [
    ['Draft', 'draft'],
    ['New', 'draft'],
    ['Sent', 'sent'],
    ['Awaiting Approval', 'sent'],
    ['Approved', 'approved'],
    ['Won', 'approved'],
    ['Rejected', 'rejected'],
    ['Lost', 'rejected'],
    ['Expired', 'expired'],
  ]
  
  const jobStatusTests = [
    ['New', 'pending'],
    ['Pending', 'pending'],
    ['Art Approval', 'art-approval'],
    ['Scheduled', 'scheduled'],
    ['In Production', 'printing'],
    ['Printing', 'printing'],
    ['Finishing', 'finishing'],
    ['Complete', 'ready'],
    ['Ready for Pickup', 'ready'],
    ['Shipped', 'shipped'],
    ['Delivered', 'delivered'],
  ]
  
  console.log('Quote Status Mappings:')
  quoteStatusTests.forEach(([input, expected]) => {
    const testQuote = { ...sampleAPIQuote, orderstatus: { id: 1, name: input, color: '' } }
    const result = transformQuote(testQuote)
    const passed = result.status === expected
    console.log(`${passed ? '✅' : '❌'} "${input}" → "${result.status}" (expected: "${expected}")`)
  })
  
  console.log('\nJob Status Mappings:')
  jobStatusTests.forEach(([input, expected]) => {
    const testJob = { ...sampleAPIJob, orderstatus: { id: 1, name: input, color: '' } }
    const result = transformJob(testJob)
    const passed = result.status === expected
    console.log(`${passed ? '✅' : '❌'} "${input}" → "${result.status}" (expected: "${expected}")`)
  })
  
  console.groupEnd()
}

// ============================================================================
// Run All Tests
// ============================================================================

export function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('         MINT PRINTS API ADAPTER - TEST SUITE              ')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
  
  const results = {
    customer: testCustomerTransform(),
    quote: testQuoteTransform(),
    job: testJobTransform(),
  }
  
  testStatusMappings()
  
  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('                      SUMMARY                               ')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`Customer Transform: ${results.customer ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Quote Transform:    ${results.quote ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Job Transform:      ${results.job ? '✅ PASS' : '❌ FAIL'}`)
  console.log('')
  
  const allPassed = Object.values(results).every(r => r)
  console.log(allPassed 
    ? '🎉 All tests passed! Adapter is ready for integration.'
    : '⚠️  Some tests failed. Review output above.')
  
  return allPassed
}

// Export sample data for use in development
export const testData = {
  customer: sampleAPICustomer,
  quote: sampleAPIQuote,
  job: sampleAPIJob,
}

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
  (window as any).runAdapterTests = runAllTests
  (window as any).testData = testData
  console.log('💡 Run tests with: runAdapterTests()')
}
