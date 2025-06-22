import { useSearchParams, useNavigate } from 'react-router-dom';
import Leaderboard from './Leaderboard';

const LeaderboardWrapper = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameMode = searchParams.get('mode') as 'single' | 'battle' | null;

  // Default to single player if mode is not specified or invalid
  const finalGameMode = gameMode === 'battle' ? 'battle' : 'single';

  return <Leaderboard gameMode={finalGameMode} onClose={() => navigate(-1)} />;
};

export default LeaderboardWrapper; 