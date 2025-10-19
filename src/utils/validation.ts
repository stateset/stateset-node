export interface ValidationRule<T = any> {
  validate(value: T): boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[] | ValidationSchema;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorData[];
}

export interface ValidationErrorData {
  field: string;
  message: string;
  value: any;
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
    public value: any
  ) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class Validator {
  static required<T>(message: string = 'Field is required'): ValidationRule<T> {
    return {
      validate: (value: T) => value !== undefined && value !== null && value !== '',
      message,
    };
  }

  static string(message: string = 'Field must be a string'): ValidationRule<any> {
    return {
      validate: (value: any) => typeof value === 'string',
      message,
    };
  }

  static number(message: string = 'Field must be a number'): ValidationRule<any> {
    return {
      validate: (value: any) => typeof value === 'number' && !isNaN(value),
      message,
    };
  }

  static boolean(message: string = 'Field must be a boolean'): ValidationRule<any> {
    return {
      validate: (value: any) => typeof value === 'boolean',
      message,
    };
  }

  static array(message: string = 'Field must be an array'): ValidationRule<any> {
    return {
      validate: (value: any) => Array.isArray(value),
      message,
    };
  }

  static object(message: string = 'Field must be an object'): ValidationRule<any> {
    return {
      validate: (value: any) =>
        typeof value === 'object' && value !== null && !Array.isArray(value),
      message,
    };
  }

  static email(message: string = 'Field must be a valid email'): ValidationRule<string> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      validate: (value: string) => emailRegex.test(value),
      message,
    };
  }

  static url(message: string = 'Field must be a valid URL'): ValidationRule<string> {
    return {
      validate: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message,
    };
  }

  static uuid(message: string = 'Field must be a valid UUID'): ValidationRule<string> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return {
      validate: (value: string) => uuidRegex.test(value),
      message,
    };
  }

  static minLength(min: number, message?: string): ValidationRule<string | any[]> {
    return {
      validate: (value: string | any[]) => value.length >= min,
      message: message || `Field must have at least ${min} characters/items`,
    };
  }

  static maxLength(max: number, message?: string): ValidationRule<string | any[]> {
    return {
      validate: (value: string | any[]) => value.length <= max,
      message: message || `Field must have at most ${max} characters/items`,
    };
  }

  static min(min: number, message?: string): ValidationRule<number> {
    return {
      validate: (value: number) => value >= min,
      message: message || `Field must be at least ${min}`,
    };
  }

  static max(max: number, message?: string): ValidationRule<number> {
    return {
      validate: (value: number) => value <= max,
      message: message || `Field must be at most ${max}`,
    };
  }

  static pattern(regex: RegExp, message?: string): ValidationRule<string> {
    return {
      validate: (value: string) => regex.test(value),
      message: message || `Field must match the required pattern`,
    };
  }

  static oneOf<T>(values: T[], message?: string): ValidationRule<T> {
    return {
      validate: (value: T) => values.includes(value),
      message: message || `Field must be one of: ${values.join(', ')}`,
    };
  }

  static custom<T>(validator: (value: T) => boolean, message: string): ValidationRule<T> {
    return {
      validate: validator,
      message,
    };
  }

  static date(message: string = 'Field must be a valid date'): ValidationRule<any> {
    return {
      validate: (value: any) => {
        if (value instanceof Date) {
          return !isNaN(value.getTime());
        }
        if (typeof value === 'string') {
          const date = new Date(value);
          return !isNaN(date.getTime());
        }
        return false;
      },
      message,
    };
  }

  static iso8601(message: string = 'Field must be a valid ISO 8601 date'): ValidationRule<string> {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return {
      validate: (value: string) => iso8601Regex.test(value),
      message,
    };
  }

  static phoneNumber(
    message: string = 'Field must be a valid phone number'
  ): ValidationRule<string> {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return {
      validate: (value: string) => phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10,
      message,
    };
  }

  static postalCode(message: string = 'Field must be a valid postal code'): ValidationRule<string> {
    const postalCodeRegex = /^[A-Za-z0-9\s-]{3,10}$/;
    return {
      validate: (value: string) => postalCodeRegex.test(value),
      message,
    };
  }

  static currency(message: string = 'Field must be a valid currency code'): ValidationRule<string> {
    const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
    return {
      validate: (value: string) => currencyCodes.includes(value.toUpperCase()),
      message,
    };
  }

  static sku(message: string = 'Field must be a valid SKU'): ValidationRule<string> {
    const skuRegex = /^[A-Za-z0-9\-_]{1,50}$/;
    return {
      validate: (value: string) => skuRegex.test(value),
      message,
    };
  }

  static statusCode(codes: string[], message?: string): ValidationRule<string> {
    return {
      validate: (value: string) => codes.includes(value),
      message: message || `Status must be one of: ${codes.join(', ')}`,
    };
  }
}

export class SchemaValidator {
  static validate(data: any, schema: ValidationSchema, path: string = ''): ValidationResult {
    const errors: ValidationErrorData[] = [];

    for (const [key, rules] of Object.entries(schema)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const value = data?.[key];

      if (Array.isArray(rules)) {
        // It's a validation rule array
        for (const rule of rules) {
          if (!rule.validate(value)) {
            errors.push({
              field: fieldPath,
              message: rule.message,
              value,
            });
          }
        }
      } else {
        // It's a nested schema
        if (typeof value === 'object' && value !== null) {
          const nestedResult = this.validate(value, rules, fieldPath);
          errors.push(...nestedResult.errors);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateAndThrow(data: any, schema: ValidationSchema, path?: string): void {
    const result = this.validate(data, schema, path);
    if (!result.isValid) {
      const errorMessage = result.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
  }
}

// Common validation schemas
export const CommonSchemas = {
  address: {
    street_address1: [Validator.required(), Validator.string(), Validator.minLength(1)],
    city: [Validator.required(), Validator.string(), Validator.minLength(1)],
    state: [Validator.required(), Validator.string(), Validator.minLength(2)],
    postal_code: [Validator.required(), Validator.string(), Validator.postalCode()],
    country: [Validator.required(), Validator.string(), Validator.minLength(2)],
  },

  customer: {
    email: [Validator.required(), Validator.email()],
    first_name: [Validator.required(), Validator.string(), Validator.minLength(1)],
    last_name: [Validator.required(), Validator.string(), Validator.minLength(1)],
    phone: [Validator.phoneNumber()],
  },

  product: {
    name: [Validator.required(), Validator.string(), Validator.minLength(1)],
    sku: [Validator.required(), Validator.sku()],
    price: [Validator.required(), Validator.number(), Validator.min(0)],
    currency: [Validator.required(), Validator.currency()],
  },

  order: {
    customer_id: [Validator.required(), Validator.string()],
    status: [
      Validator.required(),
      Validator.statusCode(['DRAFT', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    ],
    currency: [Validator.required(), Validator.currency()],
    total: [Validator.required(), Validator.number(), Validator.min(0)],
  },

  pagination: {
    limit: [Validator.number(), Validator.min(1), Validator.max(1000)],
    offset: [Validator.number(), Validator.min(0)],
    cursor: [Validator.string()],
  },
};

// Validation decorator
export function validate(schema: ValidationSchema) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = function (this: any, ...args: any[]) {
      // Validate the first argument (usually data)
      if (args.length > 0 && args[0]) {
        SchemaValidator.validateAndThrow(args[0], schema);
      }

      return originalMethod.apply(this, args);
    } as T;

    return descriptor;
  };
}
