const client = require('prom-client');

function setupMetrics(app) {
  // Create a Registry
  const register = new client.Registry();

  // Add default metrics (CPU, memory, event loop)
  client.collectDefaultMetrics({ register });

  // HTTP request duration histogram
  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register]
  });

  // HTTP requests total counter
  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  });

  // Middleware to track metrics
  app.use((req, res, next) => {
    // Skip metrics endpoint to avoid self-tracking
    if (req.path === '/metrics') {
      return next();
    }

    const end = httpRequestDuration.startTimer({ method: req.method });
    
    res.on('finish', () => {
      const route = req.route?.path || req.path;
      const labels = {
        method: req.method,
        route: route,
        status_code: res.statusCode
      };
      
      end(labels);
      httpRequestsTotal.inc(labels);
    });
    
    next();
  });

  // Expose /metrics endpoint (BEFORE auth middleware)
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.end(metrics);
    } catch (error) {
      res.status(500).end(error);
    }
  });

  return register;
}

module.exports = { setupMetrics };