export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
