import React from 'react';
import { useState, useEffect } from 'react';

import { Box, Text, VStack, Flex, Button } from '@chakra-ui/react';

import NavBar from '../components/Navbar';

import { getAccessToken } from '../utils/auth';
import { getUsername } from '../utils/auth';
import { formatDateTime } from '../utils/time';

export default function MySchedules() {
    const [schedules, setSchedules] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await fetch("http://localhost:8000/schedules?limit=30",
                    {
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`
                        }
                    });
                if (!response.ok) {
                    throw new Error("Failed to fetch schedules");
                }
                const data = await response.json();
                // Filter schedules based on logged-in user ID
                const filteredSchedules = data.filter(
                    (schedule) => schedule.user.id === getUsername()
                );
                setSchedules(filteredSchedules);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchSchedules();
    }, []);

    const deleteSchedule = async (scheduleId) => {
        try {
            const response = await fetch(`http://localhost:8000/schedules/${scheduleId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to delete schedule");
            }
            setSchedules(schedules.filter((schedule) => schedule.id !== scheduleId));
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <NavBar />
            <VStack spacing={4} align="stretch" mt={100}>
                {schedules.length > 0 ? (
                    schedules.map((schedule, index) => (
                        <Box key={index} p={4} borderWidth={1} borderRadius="lg">
                            <Flex justifyContent="space-between" alignItems="center">
                                <Text flex="0">{index + 1}</Text>
                                    <Box flex="8">
                                        <Text>Local: {schedule.area.name}</Text>
                                        <Text>Data: {formatDateTime(schedule.start_time).formattedDate}</Text>
                                        <Text>Hora: {formatDateTime(schedule.start_time).formattedTime} - {formatDateTime(schedule.end_time).formattedTime}</Text>
                                    </Box>
                                <Button
                                    colorScheme="red"
                                    onClick={() => deleteSchedule(schedule.id)}
                                >
                                    Remove
                                </Button>
                            </Flex>
                        </Box>
                    ))
                ) : (
                    <Box>
                        <Text>No schedules available</Text>
                    </Box>
                )}
            </VStack>
        </>
    );
}
