require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const PricingRule = require('../models/PricingRule');
const Quote = require('../models/Quote');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    PricingRule.deleteMany({}),
    Quote.deleteMany({}),
  ]);
  console.log('Cleared existing data...');

  // ── Users ─────────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@quoteforge.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const sales1 = await User.create({
    name: 'Rajesh Kumar',
    email: 'sales@quoteforge.com',
    password: 'Sales@123',
    role: 'sales',
  });

  const sales2 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@quoteforge.com',
    password: 'Sales@123',
    role: 'sales',
  });

  console.log('Users created...');

  // ── Products ──────────────────────────────────────────────────────────────
  const transformer = await Product.create({
    name: 'Industrial Transformer',
    description: 'Heavy-duty industrial grade transformer for high-voltage applications.',
    category: 'Electrical',
    basePrice: 15000,
    currency: 'INR',
    createdBy: admin._id,
    attributes: [
      {
        name: 'voltage',
        displayName: 'Voltage Rating',
        type: 'select',
        required: true,
        order: 1,
        options: [
          { label: '110V', value: '110', priceImpact: 0 },
          { label: '220V', value: '220', priceImpact: 1500 },
          { label: '440V', value: '440', priceImpact: 3000 },
          { label: '11kV', value: '11000', priceImpact: 8000 },
        ],
      },
      {
        name: 'material',
        displayName: 'Winding Material',
        type: 'select',
        required: true,
        order: 2,
        options: [
          { label: 'Aluminium', value: 'aluminium', priceImpact: 0 },
          { label: 'Copper', value: 'copper', priceImpact: 2000 },
        ],
      },
      {
        name: 'cooling',
        displayName: 'Cooling Method',
        type: 'select',
        required: true,
        order: 3,
        options: [
          { label: 'Air Cooled (Dry)', value: 'air', priceImpact: 0 },
          { label: 'Oil Cooled', value: 'oil', priceImpact: 1000 },
          { label: 'Forced Air', value: 'forcedair', priceImpact: 500 },
        ],
      },
      {
        name: 'capacity',
        displayName: 'KVA Capacity',
        type: 'select',
        required: true,
        order: 4,
        options: [
          { label: '25 KVA', value: '25', priceImpact: 0 },
          { label: '50 KVA', value: '50', priceImpact: 2500 },
          { label: '100 KVA', value: '100', priceImpact: 5000 },
          { label: '250 KVA', value: '250', priceImpact: 12000 },
        ],
      },
      {
        name: 'overloadProtection',
        displayName: 'Overload Protection',
        type: 'toggle',
        required: false,
        order: 5,
        options: [
          { label: 'No', value: 'false', priceImpact: 0 },
          { label: 'Yes', value: 'true', priceImpact: 500 },
        ],
      },
      {
        name: 'temperatureMonitor',
        displayName: 'Temperature Monitor',
        type: 'toggle',
        required: false,
        order: 6,
        options: [
          { label: 'No', value: 'false', priceImpact: 0 },
          { label: 'Yes', value: 'true', priceImpact: 750 },
        ],
      },
    ],
  });

  const motor = await Product.create({
    name: 'Industrial AC Motor',
    description: 'Three-phase AC induction motor suitable for heavy industrial use.',
    category: 'Mechanical',
    basePrice: 8000,
    currency: 'INR',
    createdBy: admin._id,
    attributes: [
      {
        name: 'power',
        displayName: 'Power Rating (HP)',
        type: 'select',
        required: true,
        order: 1,
        options: [
          { label: '5 HP', value: '5', priceImpact: 0 },
          { label: '10 HP', value: '10', priceImpact: 1500 },
          { label: '20 HP', value: '20', priceImpact: 3500 },
          { label: '50 HP', value: '50', priceImpact: 9000 },
        ],
      },
      {
        name: 'enclosure',
        displayName: 'Enclosure Type',
        type: 'select',
        required: true,
        order: 2,
        options: [
          { label: 'Open Drip Proof (ODP)', value: 'odp', priceImpact: 0 },
          { label: 'Totally Enclosed Fan Cooled (TEFC)', value: 'tefc', priceImpact: 800 },
          { label: 'Explosion Proof', value: 'exp', priceImpact: 2500 },
        ],
      },
      {
        name: 'mounting',
        displayName: 'Mounting Type',
        type: 'select',
        required: true,
        order: 3,
        options: [
          { label: 'Foot Mount', value: 'foot', priceImpact: 0 },
          { label: 'Flange Mount', value: 'flange', priceImpact: 400 },
          { label: 'Face Mount', value: 'face', priceImpact: 400 },
        ],
      },
      {
        name: 'vfd',
        displayName: 'Variable Frequency Drive (VFD)',
        type: 'toggle',
        required: false,
        order: 4,
        options: [
          { label: 'No', value: 'false', priceImpact: 0 },
          { label: 'Yes', value: 'true', priceImpact: 2200 },
        ],
      },
    ],
  });

  console.log('Products created...');

  // ── Pricing Rules ─────────────────────────────────────────────────────────
  await PricingRule.insertMany([
    {
      name: 'High Voltage Premium',
      description: 'Add ₹1,500 for voltage > 200V',
      productId: transformer._id,
      condition: { field: 'voltage', operator: '>', value: '200' },
      addedPrice: 1500,
      priority: 10,
    },
    {
      name: 'Copper Winding Premium',
      description: 'Add ₹2,000 for copper winding',
      productId: transformer._id,
      condition: { field: 'material', operator: '==', value: 'copper' },
      addedPrice: 2000,
      priority: 9,
    },
    {
      name: 'Oil Cooling Extra',
      description: 'Add ₹1,000 for oil cooling method',
      productId: transformer._id,
      condition: { field: 'cooling', operator: '==', value: 'oil' },
      addedPrice: 1000,
      priority: 8,
    },
    {
      name: 'Overload Protection Add-on',
      description: 'Add ₹500 for overload protection feature',
      productId: transformer._id,
      condition: { field: 'overloadProtection', operator: '==', value: 'true' },
      addedPrice: 500,
      priority: 7,
    },
    {
      name: 'Temperature Monitor Add-on',
      description: 'Add ₹750 for temperature monitoring system',
      productId: transformer._id,
      condition: { field: 'temperatureMonitor', operator: '==', value: 'true' },
      addedPrice: 750,
      priority: 6,
    },
    {
      name: 'High Capacity Surcharge',
      description: 'Add ₹3,000 for 100+ KVA capacity',
      productId: transformer._id,
      condition: { field: 'capacity', operator: '>=', value: '100' },
      addedPrice: 3000,
      priority: 5,
    },
    {
      name: 'VFD Drive Premium',
      description: 'Add ₹2,200 for variable frequency drive',
      productId: motor._id,
      condition: { field: 'vfd', operator: '==', value: 'true' },
      addedPrice: 2200,
      priority: 9,
    },
    {
      name: 'Explosion Proof Enclosure',
      description: 'Add ₹2,500 for explosion-proof enclosure',
      productId: motor._id,
      condition: { field: 'enclosure', operator: '==', value: 'exp' },
      addedPrice: 2500,
      priority: 8,
    },
  ]);

  console.log('Pricing rules created...');

  // ── Sample Quotes ─────────────────────────────────────────────────────────
  await Quote.create({
    customer: { name: 'Mahindra Industries', email: 'purchase@mahindra.com', company: 'Mahindra & Mahindra Ltd', phone: '+91-22-2490-1234' },
    product: { id: transformer._id, name: transformer.name, category: transformer.category },
    configuration: { voltage: '220', material: 'copper', cooling: 'oil', capacity: '50', overloadProtection: 'true', temperatureMonitor: 'false' },
    basePrice: 15000,
    lineItems: [
      { description: 'High Voltage Premium (voltage > 200V)', amount: 1500 },
      { description: 'Copper Winding Premium', amount: 2000 },
      { description: 'Oil Cooling Extra', amount: 1000 },
      { description: 'High KVA Capacity (50 KVA)', amount: 2500 },
      { description: 'Overload Protection Add-on', amount: 500 },
    ],
    totalPrice: 22500,
    status: 'approved',
    salesRep: { id: sales1._id, name: sales1.name, email: sales1.email },
    approvedBy: admin._id,
  });

  await Quote.create({
    customer: { name: 'Tata Steel Ltd', email: 'eng@tatasteel.com', company: 'Tata Steel', phone: '+91-33-2345-6789' },
    product: { id: transformer._id, name: transformer.name, category: transformer.category },
    configuration: { voltage: '440', material: 'copper', cooling: 'forcedair', capacity: '100', overloadProtection: 'true', temperatureMonitor: 'true' },
    basePrice: 15000,
    lineItems: [
      { description: 'High Voltage Premium (voltage > 200V)', amount: 1500 },
      { description: 'Copper Winding Premium', amount: 2000 },
      { description: 'High Capacity Surcharge (≥100 KVA)', amount: 3000 },
      { description: 'Overload Protection Add-on', amount: 500 },
      { description: 'Temperature Monitor Add-on', amount: 750 },
    ],
    totalPrice: 27750,
    status: 'pending',
    salesRep: { id: sales1._id, name: sales1.name, email: sales1.email },
  });

  await Quote.create({
    customer: { name: 'Reliance Industries', email: 'procurement@ril.com', company: 'Reliance Industries Ltd', phone: '+91-22-4477-0000' },
    product: { id: motor._id, name: motor.name, category: motor.category },
    configuration: { power: '20', enclosure: 'tefc', mounting: 'flange', vfd: 'true' },
    basePrice: 8000,
    lineItems: [
      { description: 'VFD Drive Premium', amount: 2200 },
      { description: 'TEFC Enclosure', amount: 800 },
      { description: 'Flange Mount', amount: 400 },
    ],
    totalPrice: 11400,
    status: 'draft',
    salesRep: { id: sales2._id, name: sales2.name, email: sales2.email },
  });

  console.log('Sample quotes created...');
  console.log('\n✅  Seed complete!');
  console.log('──────────────────────────────');
  console.log('Admin:  admin@quoteforge.com  / Admin@123');
  console.log('Sales:  sales@quoteforge.com  / Sales@123');
  console.log('Sales2: priya@quoteforge.com  / Sales@123');
  console.log('──────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
