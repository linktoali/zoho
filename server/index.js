import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import squarePkg from 'square';
import crypto from 'crypto';

const { Client, Environment } = squarePkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? 5000 : (process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

if (isProduction) {
  app.use(express.static(path.join(__dirname, '../dist')));
}

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

let squareClient = null;
if (SQUARE_ACCESS_TOKEN) {
  squareClient = new Client({
    accessToken: SQUARE_ACCESS_TOKEN,
    environment: isProduction ? Environment.Production : Environment.Sandbox
  });
}

const orders = [];

const pizzaMenu = [
  {
    id: 1,
    name: 'Margherita',
    description: 'Classic pizza with fresh tomatoes, mozzarella, and basil',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Pepperoni',
    description: 'Loaded with pepperoni and extra cheese',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'BBQ Chicken',
    description: 'Grilled chicken with BBQ sauce, onions, and cilantro',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Hawaiian',
    description: 'Ham, pineapple, and mozzarella cheese',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'Veggie Supreme',
    description: 'Bell peppers, mushrooms, onions, olives, and tomatoes',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: 'Meat Lovers',
    description: 'Pepperoni, sausage, bacon, and ham',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=300&fit=crop'
  }
];

app.get('/api/pizzas', (req, res) => {
  res.json(pizzaMenu);
});

app.post('/api/orders', (req, res) => {
  try {
    const { fullName, email, address, phoneNumber, paymentMethod, pizzas, totalAmount } = req.body;
    
    const order = {
      _id: Date.now().toString(),
      fullName,
      email,
      address,
      phoneNumber,
      paymentMethod,
      pizzas,
      totalAmount,
      orderDate: new Date(),
      status: 'pending'
    };
    
    orders.push(order);
    
    console.log('New order placed:', order);
    
    res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully!',
      orderId: order._id 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to place order. Please try again.' 
    });
  }
});

app.post('/api/orders/square-payment', async (req, res) => {
  try {
    const { fullName, email, address, phoneNumber, paymentMethod, pizzas, totalAmount, paymentToken } = req.body;

    if (!squareClient) {
      return res.status(500).json({
        success: false,
        message: 'Square payment is not configured. Please contact the administrator.'
      });
    }

    if (!SQUARE_LOCATION_ID) {
      return res.status(500).json({
        success: false,
        message: 'Square location ID is not configured.'
      });
    }

    const amountInCents = Math.round(totalAmount * 100);

    const paymentResponse = await squareClient.paymentsApi.createPayment({
      sourceId: paymentToken,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(amountInCents),
        currency: 'USD'
      },
      locationId: SQUARE_LOCATION_ID
    });

    const order = {
      _id: Date.now().toString(),
      fullName,
      email,
      address,
      phoneNumber,
      paymentMethod,
      pizzas,
      totalAmount,
      orderDate: new Date(),
      status: 'paid',
      paymentId: paymentResponse.result.payment.id,
      paymentStatus: paymentResponse.result.payment.status
    };

    orders.push(order);

    console.log('Square payment successful:', order);

    res.status(201).json({
      success: true,
      message: 'Payment successful! Order placed.',
      orderId: order._id
    });

  } catch (error) {
    console.error('Square payment error:', error);
    res.status(500).json({
      success: false,
      message: error.errors?.[0]?.detail || 'Payment failed. Please try again.'
    });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = orders.find(o => o._id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
