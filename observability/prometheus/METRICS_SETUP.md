# Enabling Metrics in ShopSphere Services

Your services are showing as DOWN because they need to expose metrics endpoints. Here's how to fix this:

## 1. Add Prometheus Client Library

For each Node.js service, install the prometheus client:

```bash
npm install prom-client
```

## 2. Add Metrics Middleware

Create a `metrics.js` file in each service:

```javascript
const client = require('prom-client');
const express = require('express');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Middleware to track metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

// Metrics endpoint
const metricsRouter = express.Router();
metricsRouter.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
});

module.exports = {
  metricsMiddleware,
  metricsRouter,
  register
};
```

## 3. Add to Your Service

In your service's main file (e.g., `index.js`):

```javascript
const { metricsMiddleware, metricsRouter } = require('./metrics');

// Add before your routes
app.use(metricsMiddleware);

// Add metrics endpoint
app.use(metricsRouter);
```

## 4. Service-Specific Metrics

### Auth Service
```javascript
// Track login attempts
const loginAttempts = new client.Counter({
  name: 'auth_login_attempts_total',
  help: 'Total login attempts',
  labelNames: ['status'],
  registers: [register]
});

// In your login route
loginAttempts.labels('success').inc();
// or
loginAttempts.labels('failure').inc();
```

### Payment Service
```javascript
// Track payment processing
const paymentProcessed = new client.Counter({
  name: 'payment_processed_total',
  help: 'Total payments processed',
  labelNames: ['status', 'provider'],
  registers: [register]
});

const paymentDuration = new client.Histogram({
  name: 'payment_processing_duration_seconds',
  help: 'Payment processing duration',
  labelNames: ['provider'],
  registers: [register]
});
```

### Cart Service
```javascript
// Track cart operations
const cartOperations = new client.Counter({
  name: 'cart_operations_total',
  help: 'Total cart operations',
  labelNames: ['operation'],
  registers: [register]
});

// Usage
cartOperations.labels('add_item').inc();
cartOperations.labels('remove_item').inc();
cartOperations.labels('checkout').inc();
```

### Order Service
```javascript
// Track orders
const ordersCreated = new client.Counter({
  name: 'order_created_total',
  help: 'Total orders created',
  registers: [register]
});

const orderRevenue = new client.Counter({
  name: 'order_revenue_total',
  help: 'Total order revenue',
  registers: [register]
});

// Track order queue
const orderQueue = new client.Gauge({
  name: 'order_processing_queue_size',
  help: 'Number of orders in processing queue',
  registers: [register]
});
```

## 5. MongoDB and Redis Exporters

Add these to your docker-compose.yml if you want database metrics:

```yaml
  mongodb-exporter:
    image: bitnami/mongodb-exporter:latest
    container_name: mongodb-exporter
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
    ports:
      - "9216:9216"
    networks:
      - monitoring
      - shopsphere_default
    restart: unless-stopped

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: redis-exporter
    environment:
      - REDIS_ADDR=redis://redis:6379
    ports:
      - "9121:9121"
    networks:
      - monitoring
      - shopsphere_default
    restart: unless-stopped
```

## 6. Gateway Metrics

For Express Gateway, you need to add a custom plugin or middleware to expose metrics.

## 7. Testing

After adding metrics to a service:

1. Restart the service
2. Check metrics endpoint: `curl http://localhost:5001/metrics`
3. Verify in Prometheus: http://localhost:9090/targets

## Common Issues

1. **404 on /metrics**: Make sure the metrics router is added before your catch-all routes
2. **Connection refused**: Check if the service is running and the port is correct
3. **No data in Grafana**: Wait a few minutes for Prometheus to scrape the metrics

## Example Full Implementation

Here's a complete example for a service:

```javascript
const express = require('express');
const { metricsMiddleware, metricsRouter } = require('./metrics');

const app = express();

// Metrics middleware - MUST be before routes
app.use(metricsMiddleware);

// Your regular middleware
app.use(express.json());

// Metrics endpoint
app.use(metricsRouter);

// Your routes
app.use('/api', yourRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});
```