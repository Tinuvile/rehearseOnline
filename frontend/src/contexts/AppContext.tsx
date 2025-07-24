import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Project, Video, Actor, TranscriptSegment, ActorPosition, LightingCue, MusicCue, AISuggestions } from '../types';

// 初始状态
const initialState: AppState = {
  actors: [],
  transcripts: [],
  actorPositions: [],
  lightingCues: [],
  musicCues: [],
  currentTime: 0,
  isPlaying: false,
  aiSuggestions: {},
  loading: false
};

// Action类型
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | undefined }
  | { type: 'SET_CURRENT_VIDEO'; payload: Video | undefined }
  | { type: 'SET_ACTORS'; payload: Actor[] }
  | { type: 'ADD_ACTOR'; payload: Actor }
  | { type: 'SET_TRANSCRIPTS'; payload: TranscriptSegment[] }
  | { type: 'SET_ACTOR_POSITIONS'; payload: ActorPosition[] }
  | { type: 'UPDATE_ACTOR_POSITION'; payload: { actorId: string; timestamp: number; position: { x: number; y: number } } }
  | { type: 'SET_LIGHTING_CUES'; payload: LightingCue[] }
  | { type: 'ADD_LIGHTING_CUE'; payload: LightingCue }
  | { type: 'SET_MUSIC_CUES'; payload: MusicCue[] }
  | { type: 'ADD_MUSIC_CUE'; payload: MusicCue }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_AI_SUGGESTIONS'; payload: AISuggestions }
  | { type: 'CLEAR_ALL_DATA' };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'SET_CURRENT_VIDEO':
      return { ...state, currentVideo: action.payload };
    
    case 'SET_ACTORS':
      return { ...state, actors: action.payload };
    
    case 'ADD_ACTOR':
      return { ...state, actors: [...state.actors, action.payload] };
    
    case 'SET_TRANSCRIPTS':
      return { ...state, transcripts: action.payload };
    
    case 'SET_ACTOR_POSITIONS':
      return { ...state, actorPositions: action.payload };
    
    case 'UPDATE_ACTOR_POSITION':
      return {
        ...state,
        actorPositions: state.actorPositions.map(pos => 
          pos.actor_id === action.payload.actorId && 
          Math.abs(pos.timestamp - action.payload.timestamp) < 0.1
            ? { ...pos, position_2d: action.payload.position }
            : pos
        )
      };
    
    case 'SET_LIGHTING_CUES':
      return { ...state, lightingCues: action.payload };
    
    case 'ADD_LIGHTING_CUE':
      return { ...state, lightingCues: [...state.lightingCues, action.payload] };
    
    case 'SET_MUSIC_CUES':
      return { ...state, musicCues: action.payload };
    
    case 'ADD_MUSIC_CUE':
      return { ...state, musicCues: [...state.musicCues, action.payload] };
    
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    
    case 'SET_AI_SUGGESTIONS':
      return { ...state, aiSuggestions: action.payload };
    
    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        currentProject: state.currentProject
      };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// 便捷的action creators
export const useAppActions = () => {
  const { dispatch } = useAppContext();

  return {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | undefined) => dispatch({ type: 'SET_ERROR', payload: error }),
    setCurrentProject: (project: Project | undefined) => dispatch({ type: 'SET_CURRENT_PROJECT', payload: project }),
    setCurrentVideo: (video: Video | undefined) => dispatch({ type: 'SET_CURRENT_VIDEO', payload: video }),
    setActors: (actors: Actor[]) => dispatch({ type: 'SET_ACTORS', payload: actors }),
    addActor: (actor: Actor) => dispatch({ type: 'ADD_ACTOR', payload: actor }),
    setTranscripts: (transcripts: TranscriptSegment[]) => dispatch({ type: 'SET_TRANSCRIPTS', payload: transcripts }),
    setActorPositions: (positions: ActorPosition[]) => dispatch({ type: 'SET_ACTOR_POSITIONS', payload: positions }),
    updateActorPosition: (actorId: string, timestamp: number, position: { x: number; y: number }) => 
      dispatch({ type: 'UPDATE_ACTOR_POSITION', payload: { actorId, timestamp, position } }),
    setLightingCues: (cues: LightingCue[]) => dispatch({ type: 'SET_LIGHTING_CUES', payload: cues }),
    addLightingCue: (cue: LightingCue) => dispatch({ type: 'ADD_LIGHTING_CUE', payload: cue }),
    setMusicCues: (cues: MusicCue[]) => dispatch({ type: 'SET_MUSIC_CUES', payload: cues }),
    addMusicCue: (cue: MusicCue) => dispatch({ type: 'ADD_MUSIC_CUE', payload: cue }),
    setCurrentTime: (time: number) => dispatch({ type: 'SET_CURRENT_TIME', payload: time }),
    setPlaying: (playing: boolean) => dispatch({ type: 'SET_PLAYING', payload: playing }),
    setAISuggestions: (suggestions: AISuggestions) => dispatch({ type: 'SET_AI_SUGGESTIONS', payload: suggestions }),
    clearAllData: () => dispatch({ type: 'CLEAR_ALL_DATA' })
  };
};