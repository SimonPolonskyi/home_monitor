import { config } from '../../config/config.js';

/**
 * Middleware для перевірки API ключа від пристроїв
 */
export function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'Missing X-API-Key header' 
    });
  }
  
  if (apiKey !== config.api.deviceApiKey) {
    return res.status(403).json({ 
      error: 'Invalid API key' 
    });
  }
  
  next();
}
