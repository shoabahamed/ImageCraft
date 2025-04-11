import {
  createContext,
  useReducer,
  useEffect,
  ReactNode,
  Dispatch,
  useState,
} from "react";

// Define the structure of the user object
interface User {
  email: string;
  token: string;
  role: string;
  username: string;
  userId: string;
  // Add more fields as necessary based on your application
}

// Define the structure of the state
interface AuthState {
  user: User | null;
}

// Define the types of actions for the reducer
type AuthAction = { type: "LOGIN"; payload: User } | { type: "LOGOUT" };

// Create the AuthContext with the appropriate types
export const AuthContext = createContext<{
  user: User | null;
  dispatch: Dispatch<AuthAction>;
  loading: boolean;
} | null>(null);

// Define the authReducer with typed parameters
export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

// Define the props for the AuthContextProvider component
interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      dispatch({ type: "LOGIN", payload: JSON.parse(user) });
    }

    setLoading(false);
  }, []);

  // console.log("AuthContext state:", state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
