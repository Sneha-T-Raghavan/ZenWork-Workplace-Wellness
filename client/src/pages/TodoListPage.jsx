
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Calendar, Clock, Check, Tag, Edit, Trash2, Plus, Filter, ArrowUp, ArrowDown, Calendar as CalendarIcon, X, List } from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Sample color palette for categories
const categoryColors = {
  personal: 'bg-blue-100 text-blue-800 border-blue-300',
  professional: 'bg-purple-100 text-purple-800 border-purple-300',
  daily: 'bg-green-100 text-green-800 border-green-300',
  weekly: 'bg-amber-100 text-amber-800 border-amber-300',
  monthly: 'bg-rose-100 text-rose-800 border-rose-300',
  urgent: 'bg-red-100 text-red-800 border-red-300',
  calendar: 'bg-blue-100 text-blue-800 border-blue-300'
};

// Google Calendar API Helper Functions
const loadGoogleCalendarAPI = () => {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      console.log('Loading gapi script');
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.onload = () => {
        console.log('gapi script loaded');
        window.gapi.load('client', {
          callback: () => {
            console.log('gapi client loaded');
            resolve();
          },
          onerror: (error) => {
            console.error('Failed to load gapi client:', error);
            reject(error);
          }
        });
      };
      gapiScript.onerror = (error) => {
        console.error('Failed to load gapi script:', error);
        reject(error);
      };
      document.body.appendChild(gapiScript);
    } else {
      console.log('gapi already loaded');
      window.gapi.load('client', {
        callback: () => resolve(),
        onerror: (error) => reject(error)
      });
    }

    if (!window.google) {
      console.log('Loading GIS script');
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.async = true;
      gisScript.onload = () => console.log('GIS script loaded');
      gisScript.onerror = (error) => {
        console.error('Failed to load GIS script:', error);
        reject(error);
      };
      document.body.appendChild(gisScript);
    } else {
      console.log('GIS already loaded');
    }
  });
};

const initGoogleCalendar = async (showAlertMessage) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    const error = new Error('Missing Google API key in environment variables');
    console.error(error.message);
    showAlertMessage('Configuration error: Missing Google API key');
    throw error;
  }

  console.log('Environment variables:', { apiKey: '[REDACTED]' });
  try {
    await loadGoogleCalendarAPI();
    await window.gapi.client.init({
      apiKey,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    });
    console.log('Google Calendar API initialized successfully');
  } catch (error) {
    console.error('Google Calendar initialization failed:', error);
    showAlertMessage(`Failed to initialize Google Calendar: ${error.message || 'Unknown error'}`);
    throw error;
  }
};

const fetchCalendarEvents = async (setGoogleSignedIn, showAlertMessage) => {
  try {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.getToken()) {
      console.log('No valid token found');
      showAlertMessage('Please sign in to access Google Calendar events');
      setGoogleSignedIn(false);
      return [];
    }

    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 30);

    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    console.log('Fetched calendar events:', response.result.items);
    return response.result.items.map((event) => ({
      id: event.id,
      title: event.summary,
      deadline: event.start.dateTime || event.start.date,
      description: event.description || '',
      category: 'calendar',
      completed: false,
      source: 'google'
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    if (error.status === 401 || error.status === 403) {
      showAlertMessage('Session expired. Please sign in again.');
      setGoogleSignedIn(false);
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken(null);
      }
    } else {
      showAlertMessage(`Failed to fetch calendar events: ${error.message || 'Unknown error'}`);
    }
    return [];
  }
};

// Main TodoListPage Component
const TodoListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    category: 'personal',
    timeCategory: 'daily',
    completed: false,
    source: 'app'
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    timeCategory: 'all',
    completed: 'all',
    searchQuery: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'deadline',
    direction: 'asc'
  });
  const [googleSignedIn, setGoogleSignedIn] = useState(false);
  const [calendarSynced, setCalendarSynced] = useState(false);
  const [gisClient, setGisClient] = useState(null);
  const [googleApiInitialized, setGoogleApiInitialized] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // New state for view mode

  // Initialize moment localizer for react-big-calendar
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const setupGoogleCalendar = async () => {
      try {
        console.log('Starting Google Calendar setup...');
        await initGoogleCalendar(showAlertMessage);
        console.log('Checking for Google Identity Services...');

        const waitForGIS = () => {
          return new Promise((resolve, reject) => {
            const maxAttempts = 20;
            let attempts = 0;
            const interval = setInterval(() => {
              attempts++;
              if (window.google && window.google.accounts) {
                console.log('GIS available after', attempts, 'attempts');
                clearInterval(interval);
                resolve();
              } else if (attempts >= maxAttempts) {
                console.error('Google Identity Services failed to load after', maxAttempts, 'attempts');
                clearInterval(interval);
                reject(new Error('Google Identity Services not loaded'));
              }
            }, 500);
          });
        };

        await waitForGIS().catch(() => {
          showAlertMessage('Failed to load Google authentication service. Please check your network and try again.');
          throw new Error('Google Identity Services not loaded');
        });

        console.log('Initializing GIS client with client_id:', '[REDACTED]');
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          callback: (response) => {
            console.log('GIS callback response:', response);
            if (response.error) {
              console.error('GIS authentication error:', response);
              showAlertMessage(`Google Sign-in failed: ${response.error}`);
              setGoogleSignedIn(false);
              return;
            }
            console.log('Setting access token:', '[REDACTED]');
            window.gapi.client.setToken({ access_token: response.access_token });
            setGoogleSignedIn(true);
            showAlertMessage('Google Sign-in successful');
            setTimeout(() => {
              syncCalendarEvents();
            }, 500);
          }
        });
        setGisClient(client);
        console.log('GIS client initialized:', client);
        setGoogleApiInitialized(true);

        if (window.gapi && window.gapi.client && window.gapi.client.getToken()) {
          console.log('Found existing token, setting signed in state');
          setGoogleSignedIn(true);
        }
      } catch (error) {
        console.error('Error setting up Google Calendar:', error);
        showAlertMessage(error.message || 'Failed to initialize Google Calendar integration');
      }
    };

    setupGoogleCalendar();

    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    const localTasks = tasks.filter((task) => task.source === 'app');
    localStorage.setItem('tasks', JSON.stringify(localTasks));
    applyFiltersAndSort();
  }, [tasks, filters, sortConfig]);

  const applyFiltersAndSort = () => {
    let result = [...tasks];

    if (filters.category !== 'all') {
      result = result.filter((task) => task.category === filters.category);
    }

    if (filters.timeCategory !== 'all') {
      result = result.filter((task) => task.timeCategory === filters.timeCategory);
    }

    if (filters.completed !== 'all') {
      const isCompleted = filters.completed === 'completed';
      result = result.filter((task) => task.completed === isCompleted);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortConfig.key === 'deadline') {
        const dateA = new Date(a.deadline || '9999-12-31');
        const dateB = new Date(b.deadline || '9999-12-31');
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === 'title') {
        return sortConfig.direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });

    setFilteredTasks(result);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      showAlertMessage('Task title cannot be empty');
      return;
    }

    if (editingTaskId !== null) {
      setTasks(
        tasks.map((task) => (task.id === editingTaskId ? { ...newTask, id: task.id } : task))
      );
      setEditingTaskId(null);
      showAlertMessage('Task updated successfully');
    } else {
      const taskWithId = {
        ...newTask,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, taskWithId]);
      showAlertMessage('Task added successfully');
    }

    setNewTask({
      title: '',
      description: '',
      deadline: '',
      category: 'personal',
      timeCategory: 'daily',
      completed: false,
      source: 'app'
    });
  };

  const handleEditTask = (task) => {
    if (task.source === 'google') {
      showAlertMessage('Cannot edit Google Calendar events');
      return;
    }
    setNewTask({ ...task });
    setEditingTaskId(task.id);
  };

  const handleDeleteTask = (id) => {
    const task = tasks.find((task) => task.id === id);
    if (task.source === 'google') {
      showAlertMessage('Cannot delete Google Calendar events');
      return;
    }
    setTasks(tasks.filter((task) => task.id !== id));
    showAlertMessage('Task deleted successfully');

    if (editingTaskId === id) {
      setEditingTaskId(null);
      setNewTask({
        title: '',
        description: '',
        deadline: '',
        category: 'personal',
        timeCategory: 'daily',
        completed: false,
        source: 'app'
      });
    }
  };

  const handleToggleComplete = (id) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      if (!gisClient) {
        throw new Error('Google Identity Services not initialized');
      }
      console.log('Requesting GIS access token');
      gisClient.requestAccessToken();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      if (error.message.includes('popup')) {
        showAlertMessage('Please allow popups for this site and try again');
      } else {
        showAlertMessage(`Google Sign-in failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      if (window.google && window.google.accounts && window.gapi.client.getToken()) {
        window.google.accounts.oauth2.revoke(window.gapi.client.getToken().access_token, () => {
          console.log('Access token revoked');
          window.gapi.client.setToken(null);
          setGoogleSignedIn(false);
          setCalendarSynced(false);
          showAlertMessage('Google Sign-out successful');
        });
      } else {
        console.log('No token to revoke, signing out');
        setGoogleSignedIn(false);
        setCalendarSynced(false);
        showAlertMessage('Google Sign-out successful');
      }
    } catch (error) {
      console.error('Error signing out from Google:', error);
      showAlertMessage(`Google Sign-out failed: ${error.message || 'Unknown error'}`);
    }
  };

  const syncCalendarEvents = async () => {
    try {
      console.log('Syncing calendar events, signed in status:', googleSignedIn);
      console.log('Token available:', window.gapi && window.gapi.client && !!window.gapi.client.getToken());

      if (!window.gapi || !window.gapi.client || !window.gapi.client.getToken()) {
        console.log('Authentication check failed');

        if (!googleApiInitialized) {
          showAlertMessage('Google Calendar API is still initializing. Please try again in a moment.');
          return;
        }

        if (!googleSignedIn) {
          showAlertMessage('Please sign in with Google first');
          return;
        }

        if (googleSignedIn && gisClient) {
          showAlertMessage('Session expired, requesting new authentication');
          gisClient.requestAccessToken();
          return;
        }

        showAlertMessage('Authentication issue. Please sign in with Google again.');
        setGoogleSignedIn(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const calendarEvents = await fetchCalendarEvents(setGoogleSignedIn, showAlertMessage);
      console.log('Fetched events:', calendarEvents);

      if (Array.isArray(calendarEvents)) {
        const nonCalendarTasks = tasks.filter((task) => task.source !== 'google');
        setTasks([...nonCalendarTasks, ...calendarEvents]);
        setCalendarSynced(true);
        showAlertMessage(`Calendar events synced successfully: ${calendarEvents.length} events found`);
      }
    } catch (error) {
      console.error('Error syncing calendar events:', error);
      showAlertMessage(`Failed to sync calendar events: ${error.message || 'Unknown error'}`);

      if (error.status === 401 || error.status === 403) {
        setGoogleSignedIn(false);
      }
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDueStatus = (deadline) => {
    if (!deadline) return '';

    const now = new Date();
    const dueDate = new Date(deadline);
    const diffDays = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 font-bold';
    if (diffDays === 0) return 'text-amber-600 font-semibold';
    if (diffDays <= 2) return 'text-amber-500';
    return 'text-green-600';
  };

  // Prepare events for calendar view
  const calendarEvents = filteredTasks
    .filter((task) => task.deadline)
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.deadline),
      end: new Date(task.deadline),
      task: task // Store full task object for event details
    }));

  // Custom event styling for calendar
  const eventStyleGetter = (event) => {
    const category = event.task.category;
    const style = {
      backgroundColor: categoryColors[category]?.includes('bg-') 
        ? categoryColors[category].split(' ')[0].replace('bg-', '#') + '33' 
        : '#e5e7eb',
      borderColor: categoryColors[category]?.includes('border-') 
        ? categoryColors[category].split(' ').find(c => c.includes('border-')).replace('border-', '#') 
        : '#d1d5db',
      color: categoryColors[category]?.includes('text-') 
        ? categoryColors[category].split(' ').find(c => c.includes('text-')).replace('text-', '#') 
        : '#1f2937',
      borderRadius: '4px',
      padding: '2px 4px',
      fontSize: '12px'
    };
    return { style };
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center p-4 pt-20">
      <Navbar className="relative z-50" />
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-4 drop-shadow-sm">Task Manager</h1>
      <div className="w-full max-w-7xl px-4 pb-8">
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <CalendarIcon className="mr-2" size={20} />
                Google Calendar Integration
              </h3>
              <div>
                {!googleSignedIn ? (
                  <button
                    onClick={handleGoogleSignIn}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    disabled={!googleApiInitialized}
                  >
                    Sign in with Google
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={syncCalendarEvents}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Sync Calendar Events
                    </button>
                    <button
                      onClick={handleGoogleSignOut}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {googleSignedIn ? (
                <p className="flex items-center text-green-600">
                  <Check size={16} className="mr-1" />
                  Connected to Google Calendar
                  {calendarSynced && ' (Events synced)'}
                </p>
              ) : (
                <p className="flex items-center text-gray-500">
                  <X size={16} className="mr-1" />
                  Not connected to Google Calendar
                  {!googleApiInitialized && ' (API still loading...)'}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {editingTaskId ? 'Edit Task' : 'Add New Task'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title*</label>
                <input
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={newTask.deadline}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={newTask.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Category</label>
                <select
                  name="timeCategory"
                  value={newTask.timeCategory}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              {editingTaskId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTaskId(null);
                    setNewTask({
                      title: '',
                      description: '',
                      deadline: '',
                      category: 'personal',
                      timeCategory: 'daily',
                      completed: false,
                      source: 'app'
                    });
                  }}
                  className="mr-2 bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
              >
                <Plus size={16} className="mr-1" />
                {editingTaskId ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Filter size={18} className="mr-2" />
              Filter Tasks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="personal">Personal</option>
                  <option value="professional">Professional</option>
                  <option value="calendar">Calendar Events</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Category</label>
                <select
                  value={filters.timeCategory}
                  onChange={(e) => setFilters({ ...filters, timeCategory: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Time Categories</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.completed}
                  onChange={(e) => setFilters({ ...filters, completed: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Tasks</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder="Search tasks..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {viewMode === 'list' ? `Tasks (${filteredTasks.length})` : 'Calendar View'}
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center text-sm px-3 py-1 rounded-md ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List size={14} className="mr-1" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center text-sm px-3 py-1 rounded-md ${
                    viewMode === 'calendar'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CalendarIcon size={14} className="mr-1" />
                  Calendar View
                </button>
                {viewMode === 'list' && (
                  <>
                    <button
                      onClick={() => handleSort('deadline')}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      Sort by Date
                      {sortConfig.key === 'deadline' &&
                        (sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} className="ml-1" />
                        ) : (
                          <ArrowDown size={14} className="ml-1" />
                        ))}
                    </button>
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      Sort by Title
                      {sortConfig.key === 'title' &&
                        (sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} className="ml-1" />
                        ) : (
                          <ArrowDown size={14} className="ml-1" />
                        ))}
                    </button>
                  </>
                )}
              </div>
            </div>

            {viewMode === 'list' ? (
              filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tasks found. Add a new task or adjust your filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 transition-all ${
                        task.completed
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div>
                            <button
                              onClick={() => handleToggleComplete(task.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                task.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {task.completed && <Check size={14} />}
                            </button>
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-medium ${
                                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.description && (
                              <p
                                className={`mt-1 text-sm ${
                                  task.completed ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                {task.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              {task.category && (
                                <span
                                  className={`px-2 py-1 rounded-full ${
                                    categoryColors[task.category] || 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                                </span>
                              )}
                              {task.timeCategory && task.category !== 'calendar' && (
                                <span
                                  className={`px-2 py-1 rounded-full ${
                                    categoryColors[task.timeCategory] || 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {task.timeCategory.charAt(0).toUpperCase() + task.timeCategory.slice(1)}
                                </span>
                              )}
                              {task.source === 'google' && (
                                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  Google Calendar
                                </span>
                              )}
                              {task.deadline && (
                                <span className={`flex items-center ${getDueStatus(task.deadline)}`}>
                                  <Clock size={12} className="mr-1" />
                                  {formatDate(task.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {task.source !== 'google' && (
                            <>
                              <button
                                onClick={() => handleEditTask(task)}
                                className="p-1 text-gray-500 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-gray-500 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="h-[600px]">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={(event) => {
                    const task = event.task;
                    showAlertMessage(
                      `${task.title}\n${task.description ? `Description: ${task.description}\n` : ''}Deadline: ${formatDate(task.deadline)}`
                    );
                  }}
                  defaultView="month"
                  views={['month', 'week', 'day']}
                  popup
                  showMultiDayTimes
                />
              </div>
            )}
          </div>

          {showAlert && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className="bg-green-50 border border-green-200 w-64 p-4 rounded-md">
                <p className="text-green-800 whitespace-pre-line">{alertMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoListPage;
