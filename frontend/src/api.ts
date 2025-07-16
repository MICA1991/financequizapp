// API service for backend communication
const API_BASE_URL = 'http://localhost:5000/api';

export interface AzureAdUser {
  azureAdId: string;
  email: string;
  displayName: string;
  tenantId: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    token: string;
    isAzureAdUser?: boolean;
  };
}

export interface QuizSubmission {
  studentId: string;
  level: number;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  startTime: string;
  endTime: string;
  feedback?: string;
  questionResponses: Array<{
    question: string;
    correct: boolean;
    selected: string;
    correctAnswer: string;
    timeSpent: number;
  }>;
}

// Azure AD Authentication
export const azureAdLogin = async (accessToken: string, account: any): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/azure/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        account
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Azure AD login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Azure AD login API error:', error);
    throw error;
  }
};

export const validateAzureAdToken = async (accessToken: string, userInfo: any): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/azure/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        userInfo
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Token validation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Token validation API error:', error);
    throw error;
  }
};

// Quiz Submissions
// REMOVE submitQuizResult - not used and no backend endpoint

export const getStudentAttempts = async (studentId: string, token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/quiz/attempts/${studentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get student attempts');
    }

    return await response.json();
  } catch (error) {
    console.error('Get student attempts API error:', error);
    throw error;
  }
};

// Admin endpoints
export const getAllStudentAttempts = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get all student attempts');
    }

    return await response.json();
  } catch (error) {
    console.error('Get all student attempts API error:', error);
    throw error;
  }
};

export const getStudentDetails = async (studentId: string, token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/student/${studentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get student details');
    }

    return await response.json();
  } catch (error) {
    console.error('Get student details API error:', error);
    throw error;
  }
};

// Utility function to check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:5000/health', {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Local storage utilities for offline functionality
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const getFromLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}; 