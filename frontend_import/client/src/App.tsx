/** Scholarly Current design: route every public and workspace screen through a light academic interface with clear learning escape routes. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import NotFound from "./pages/NotFound";
import Questions from "./pages/Questions";
import Quiz from "./pages/Quiz";
import QuizSettings from "./pages/QuizSettings";
import Results from "./pages/Results";
import Upload from "./pages/Upload";

function Router() {
  return <Switch>
    <Route path="/"><Redirect to="/upload" /></Route>
    <Route path="/upload" component={Upload} />
    <Route path="/quiz-settings" component={QuizSettings} />
    <Route path="/questions" component={Questions} />
    <Route path="/quiz" component={Quiz} />
    <Route path="/results" component={Results} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="top-right" richColors /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
