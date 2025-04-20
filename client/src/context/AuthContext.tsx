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
  imageUrl: string;
}

// Define the structure of the state
interface AuthState {
  user: User | null;
}

// Define the types of actions for the reducer
type AuthAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE"; payload: Partial<User> };

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
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { user: action.payload };
    case "LOGOUT":
      localStorage.removeItem("user");
      return { user: null };
    case "UPDATE":
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { user: updatedUser };
      }
      return state;
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
