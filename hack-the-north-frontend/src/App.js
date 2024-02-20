import React, { useState, useEffect } from 'react';


// apollo client is used with React to fetch data from the GraphQL API
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

// importing buttons, tabs, and event cards that are used in the site
import Button from "./components/button";
import Tabs from "./components/tabs";
import {EventCardTitle, EventCardHeader, EventCardContent, EventCard} from "./components/eventCard";

import './App.css';

// create instance of the ApolloClient class and set up the GraphQL endpoint for data fetching
const client = new ApolloClient({
  uri: 'https://api.hackthenorth.com/v3/graphql',

  // saves previously made GraphQL queries (retrieves from here if the same query is made again instead of making new network request)
  cache: new InMemoryCache(),
});

// set up structure of GraphQL query
const GET_EVENTS = gql`
  query {
    sampleEvents {
      id
      name
      event_type
      permission
      start_time
      end_time
      description
      speakers {
        name
      }
      public_url
      private_url
      related_events
    }
  }
`;

const Component = () => {
  const { loading, error, data } = useQuery(GET_EVENTS);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelatedEvent, setSelectedRelatedEvent] = useState(null);

  // allow for persisting login despite refreshes
  useEffect(() => {
    const storedLoggedInStatus = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('username');
  
    if (storedLoggedInStatus === 'true' && storedUsername) {
      setLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const events = loggedIn
    ? data.sampleEvents
    : data.sampleEvents.filter((event) => event.permission === 'public');

  const filteredEvents = events
  .filter((event) =>
    (selectedCategory === 'All' || event.event_type.toLowerCase().includes(selectedCategory.toLowerCase())) &&
    (searchQuery === '' ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
  };

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.start_time === b.start_time) {
      return a.end_time - b.end_time;
    }
    return a.start_time - b.start_time;
  });

  // const handleLoginButtonClick = () => {
  //   setShowLoginModal(true);
  // };

  const handleLogin = () => {
    if (username === 'hackthenorth2024' && password === 'HTN1234') {
      setLoggedIn(true);
      setShowLoginModal(false);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
    } 
    
    else {
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
  };

  const sampleEvents = data.sampleEvents;

  const relatedEventsMap = {};

  sampleEvents.forEach((event) => {
    event.related_events.forEach((relatedEventId) => {
      if (!relatedEventsMap[relatedEventId]) {
        const relatedEvent = sampleEvents.find((e) => e.id === relatedEventId);

        // Include both public and private events if the user is logged in
        if (relatedEvent && (loggedIn || relatedEvent.permission === 'public')) {
          relatedEventsMap[relatedEventId] = relatedEvent.name;
        }
      }
    });
  });

  const handleRelatedEventClick = (eventId) => {
    setSelectedRelatedEvent(eventId);

    // Scroll to the related event section
    const relatedEventSection = document.getElementById(`event-${eventId}`);
    if (relatedEventSection) {
      relatedEventSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getVideoUrl = () => {
    const selectedEvent = sampleEvents.find((event) => event.id === selectedRelatedEvent);
    if (selectedEvent) {
      return loggedIn ? selectedEvent.private_url : selectedEvent.public_url;
    }
    return '';
  };

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto my-8 p-4">
        <Tabs>
          <div className="buttons-container">
            <div className="left-div">
              <Button variant="secondary" onClick={() => setSelectedCategory('All')}>
                All
              </Button>
              <Button variant="outline" onClick={() => setSelectedCategory('Workshop')}>
                Workshop
              </Button>
              <Button variant="outline" onClick={() => setSelectedCategory('Activity')}>
                Activity
              </Button>
              <Button variant="outline" onClick={() => setSelectedCategory('tech_talk')}>
                Tech Talk
              </Button>
            </div>
            
            <div className="right-div">
              <div className="search-bar">
                <input 
                  type="text"
                  placeholder="Search Event ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}/>
              </div>

              <Button variant="outline" onClick={() => (loggedIn ? handleLogout() : setShowLoginModal(true))}>
                {loggedIn ? 'Logout' : 'Login'}
              </Button>
            </div>
          </div>
        </Tabs>

        {showLoginModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleModalClose}>&times;</span>
              <div className="modal-input">
                <label>
                  <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                </label>
              </div>
              <div className="modal-input">
                <label>
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </label>
              </div>
              <button onClick={handleLogin} className="Login-button">
                Login
              </button>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 break-words">
          {loggedIn ? `Hey, ${username}!` : 'Hey!'}
        </h1>

        {sortedEvents.length === 0 ? (
          <p className='noEvents'>No events fall under this category :(</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 EventCard-container">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} className="col-span-1">
                <EventCardHeader>
                  <EventCardTitle>{event.name}</EventCardTitle>
                </EventCardHeader>
                <EventCardContent>
                    <p className="mb-4 break-words">{event.description}</p>
                    <p className="text-sm">
                      <span className="EventCard-subtitle">Start Time: </span>
                      {new Date(event.start_time).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="EventCard-subtitle">End Time: </span>
                      {new Date(event.end_time).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="EventCard-subtitle">Speakers: </span>
                      {event.speakers.map((speaker) => speaker.name).join(', ')}
                    </p>
                    {loggedIn && (
                      <p className="text-sm">
                        <span className="EventCard-subtitle">Private URL: </span>
                        <a href={event.private_url} target="_blank" rel="noopener noreferrer">
                          {event.private_url}
                        </a>
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="EventCard-subtitle">Public URL: </span>
                      <a href={event.public_url} target="_blank" rel="noopener noreferrer">
                        {event.public_url}
                      </a>
                    </p>

                    <p className="text-sm">
                      <span className="EventCard-subtitle">Related Events: </span>
                      {event.related_events.map((relatedEventId, index) => (
                        <React.Fragment key={relatedEventId}>
                          {index > 0 && ' '}
                          {relatedEventsMap[relatedEventId] && (
                            <span
                              onClick={() => handleRelatedEventClick(relatedEventId)}
                              className="related-event-link"
                            >
                              {relatedEventsMap[relatedEventId]}
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  </EventCardContent>
                </EventCard>
              ))}
            </div>
        )}
      </div>
    </div>
  );
};

const AppWithApollo = () => (
  <ApolloProvider client={client}>
    <Component />
  </ApolloProvider>
);

export default AppWithApollo;
