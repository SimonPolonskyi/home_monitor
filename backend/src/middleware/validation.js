/**
 * Middleware для валідації JSON даних
 */
export function validateJSON(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!req.is('application/json')) {
      return res.status(400).json({ 
        error: 'Content-Type must be application/json' 
      });
    }
  }
  next();
}

/**
 * Валідація даних від пристрою
 */
export function validateDeviceData(req, res, next) {
  const { device_id, timestamp } = req.body;
  
  if (!device_id) {
    return res.status(400).json({ 
      error: 'device_id is required' 
    });
  }
  
  if (!timestamp) {
    return res.status(400).json({ 
      error: 'timestamp is required' 
    });
  }
  
  if (typeof timestamp !== 'number' || timestamp <= 0) {
    return res.status(400).json({ 
      error: 'timestamp must be a positive number' 
    });
  }
  
  next();
}
