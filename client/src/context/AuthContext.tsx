import {
  createContext,
  useReducer,
  useEffect,
  ReactNode,
  Dispatch,
} from "react";

// Define the structure of the user object
interface User {
  email: string;
  token: string;
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

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      dispatch({ type: "LOGIN", payload: JSON.parse(user) });
    }
  }, []);

  console.log("AuthContext state:", state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
