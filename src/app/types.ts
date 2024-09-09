export interface AuthResponse  {
      expires: number;
      refresh_token: string;
      access_token: string;
    };


    export interface UserProfile {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      password: string | null;
      location: string | null;
      title?: string | null;
      description?: string | null;
      policies?: string[] | { [key: string]: any }[];
      // Add other fields as needed
    }


    export interface UserDirectory {
      id: string;
      name: string;
      parent?: string;
    }
