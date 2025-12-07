import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
  Group as TeamIcon,
} from '@mui/icons-material';
import { search } from '../../services/dashboardService';
import { searchTasks } from '../../services/taskService';
import { useNavigate } from 'react-router-dom';
import { Task, User, Team } from '../../types';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{
    tasks: Task[];
    users: User[];
    teams: Team[];
  }>({
    tasks: [],
    users: [],
    teams: [],
  });
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // For a real application, you would use a dedicated search API
      // but we're using a mix of APIs for this demo
      const response = await search(searchQuery);
      
      if (response.success) {
        setResults(response.data);
      } else {
        // Fallback to just searching tasks
        const tasksResponse = await searchTasks(searchQuery);
        if (tasksResponse.success) {
          setResults({
            tasks: tasksResponse.data.content,
            users: [],
            teams: [],
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateToTask = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  const navigateToUser = (userId: number) => {
    // In a real app, navigate to user profile
    navigate(`/users/${userId}`);
  };

  const navigateToTeam = (teamId: number) => {
    navigate(`/team/${teamId}`);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Search
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for tasks, users, or teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>

        {(results.tasks.length > 0 || results.users.length > 0 || results.teams.length > 0) && (
          <Box>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab
                label={`Tasks (${results.tasks.length})`}
                icon={<TaskIcon />}
                iconPosition="start"
              />
              <Tab
                label={`Users (${results.users.length})`}
                icon={<PersonIcon />}
                iconPosition="start"
              />
              <Tab
                label={`Teams (${results.teams.length})`}
                icon={<TeamIcon />}
                iconPosition="start"
              />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <List>
                {results.tasks.length > 0 ? (
                  results.tasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <ListItem component="button" onClick={() => navigateToTask(task.id)}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <TaskIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={task.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {task.status}
                              </Typography>
                              {` — ${task.description.substring(0, 60)}${
                                task.description.length > 60 ? '...' : ''
                              }`}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body1" align="center">
                    No tasks found matching your query.
                  </Typography>
                )}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <List>
                {results.users.length > 0 ? (
                  results.users.map((user) => (
                    <React.Fragment key={user.id}>
                      <ListItem component="button" onClick={() => navigateToUser(user.id)}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          secondary={user.email}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body1" align="center">
                    No users found matching your query.
                  </Typography>
                )}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <List>
                {results.teams.length > 0 ? (
                  results.teams.map((team) => (
                    <React.Fragment key={team.id}>
                      <ListItem component="button" onClick={() => navigateToTeam(team.id)}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <TeamIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={team.name}
                          secondary={team.description}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body1" align="center">
                    No teams found matching your query.
                  </Typography>
                )}
              </List>
            </TabPanel>
          </Box>
        )}

        {searchQuery && !loading && 
          results.tasks.length === 0 && 
          results.users.length === 0 && 
          results.teams.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">No results found</Typography>
            <Typography variant="body1" color="text.secondary">
              Try a different search term or check your spelling.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Search; 