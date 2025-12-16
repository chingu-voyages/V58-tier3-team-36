import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: name, email, and password are required' 
        },
        { status: 400 }
      );
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Registration failed' 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        user: data.user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during registration' 
      },
      { status: 500 }
    );
  }
}
