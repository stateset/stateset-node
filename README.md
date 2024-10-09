# Stateset Node.js Library

The Stateset Node library provides convenient access to the Stateset API from applications written in server-side JavaScript.

## Installation

Install the package with:

```bash
npm install stateset-node --save
```

## Usage

The package needs to be configured with your account's secret key, which is available in the Stateset Cloud Platform Dashboard.

### Returns Example

```jsx

import { NextRequest, NextResponse } from "next/server";
import stateset from 'stateset-node';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  
  try {

    // Initialize the stateset client
    const apiKey = process.env.STATESET_API_KEY;

    const _stateset = new stateset({apiKey});

    // Fetch returns
    const response = await stateset.returns.list();

    const returns = response.returns;

    // Return the fetched returns
    return NextResponse.json({ returns });
    
  } catch (error) {
    console.error('Error fetching returns:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

```

