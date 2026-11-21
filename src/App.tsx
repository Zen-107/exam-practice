import { useHashRoute } from './router';
import Home from './pages/Home';
import QuestionList from './pages/QuestionList';
import Practice from './pages/Practice';
import Exam from './pages/Exam';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import { Shell } from './components/ui';
import { getLastSet } from './store/prefs';

export default function App() {
  const [page, arg] = useHashRoute();
  let body;
  switch (page) {
    case 'list': body = <QuestionList key={arg} setId={arg ?? getLastSet()} />; break;
    case 'q': body = <Practice key={arg} id={arg} />; break;
    case 'exam': body = <Exam key={arg} setId={arg ?? getLastSet()} />; break;
    case 'stats': body = <Stats />; break;
    case 'settings': body = <Settings />; break;
    default: body = <Home />;
  }
  return <Shell>{body}</Shell>;
}
