import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Typography, Chip } from "@mui/material";
import useRoomBookingStore from "../../../store/roomBookingStore";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const BookingAnalysis = () => {
  const { roomBookings, fetchRoomBookings } = useRoomBookingStore();
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchRoomBookings();
      setLoading(false);
    };
    loadData();
  }, [fetchRoomBookings]);

  useEffect(() => {
    if (roomBookings.length > 0) {
      processBookingData();
    }
  }, [roomBookings]);

  const processBookingData = () => {
    const roomStats = {};

    roomBookings.forEach((booking) => {
      const room = booking.room || "Unknown";
      roomStats[room] = (roomStats[room] || 0) + 1;
    });

    const roomChartData = Object.entries(roomStats).map(([name, value]) => ({
      name: `Room ${name}`,
      value,
      percentage: ((value / roomBookings.length) * 100).toFixed(1) + "%",
    }));

    setRoomData(roomChartData);
  };

  if (loading) return <Typography>Loading booking data...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Booking Analysis
      </Typography>

      <Typography variant="h6" gutterBottom>
        Room Booking Distribution
        <Chip
          label={`Total: ${roomBookings.length} bookings`}
          color="primary"
          sx={{ ml: 2 }}
        />
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={roomData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}`}
            outerRadius={150}
            dataKey="value"
          >
            {roomData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `${value} bookings`,
              props.payload.percentage,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BookingAnalysis;
