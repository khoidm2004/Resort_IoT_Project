import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Collapse,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import useFeedbackStore from "../../../store/feedbackStore";
import useLaundryBookingStore from "../../../store/laundryBookingStore";
import useSaunaBookingStore from "../../../store/saunaBookingStore";

const FacilityReport = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMaintenance, setExpandedMaintenance] = useState(false);

  const { feedbacks, fetchFeedbacks } = useFeedbackStore();
  const { laundryBookings, fetchLaundryBookings } = useLaundryBookingStore();
  const { saunaBookings, fetchSaunaBookings } = useSaunaBookingStore();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchFeedbacks();
      await fetchLaundryBookings();
      await fetchSaunaBookings();
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const maintenanceKeywords = [
      "broken",
      "repair",
      "maintenance",
      "damage",
      "not working",
      "issue",
      "maintain",
      "fix",
      "fault",
      "error",
      "out of order",
    ];

    // Filter feedbacks to find maintenance issues
    const maintenanceIssues = feedbacks.filter((f) => {
      if (!f.complaint?.complaintTitle) return false;

      const title = f.complaint.complaintTitle.toLowerCase();
      return maintenanceKeywords.some((keyword) => title.includes(keyword));
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const laundryUsage = laundryBookings.filter(
      (b) => new Date(b.bookingPeriod.startFrom.toDate()) > thirtyDaysAgo,
    ).length;

    const saunaUsage = saunaBookings.filter(
      (b) => new Date(b.bookingPeriod.startFrom.toDate()) > thirtyDaysAgo,
    ).length;

    const newReports = [];

    // Add maintenance report if there are maintenance issues
    if (maintenanceIssues.length > 0) {
      newReports.push({
        type: "maintenance",
        message: `${maintenanceIssues.length} maintenance issues reported`,
        status: "Needs Attention",
        details: maintenanceIssues.map((issue) => ({
          title: issue.complaint?.complaintTitle || "No title",
          description: issue.complaint?.complaintContent || "No description",
          date: issue.createdAt?.toDate?.() || new Date(),
          reporter: issue.client.fullName || "Anonymous",
        })),
      });
    }

    // Add laundry usage report
    newReports.push({
      type: "laundry",
      message: `Laundry room: ${laundryUsage} bookings this month`,
      status: laundryUsage > 30 ? "High Usage" : "Normal",
    });

    // Add sauna usage report
    newReports.push({
      type: "sauna",
      message: `Sauna: ${saunaUsage} bookings this month`,
      status: saunaUsage > 30 ? "High Usage" : "Normal",
    });

    setReports(newReports); // Update the reports state
  }, [isLoading, feedbacks, laundryBookings, saunaBookings]);

  const toggleMaintenanceExpand = () => {
    setExpandedMaintenance(!expandedMaintenance);
  };

  if (isLoading)
    return (
      <Typography sx={{ fontFamily: "Montserrat" }}>
        Generating facility report...
      </Typography>
    );

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
      >
        Facility Status Report
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        {reports.map((report, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              borderLeft: `4px solid ${
                report.status === "Needs Attention"
                  ? "#ff6b6b" // Red for "Needs Attention"
                  : report.status === "High Usage"
                  ? "#feca57" // Yellow for "High Usage"
                  : "#1dd1a1" // Green for "Normal"
              }`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                fontWeight="medium"
                sx={{ fontFamily: "Montserrat" }}
              >
                {report.type === "maintenance" && (
                  <Icon
                    icon="mdi:alert-circle-outline"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                )}
                {report.type === "laundry" && (
                  <Icon
                    icon="mdi:washing-machine"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                )}
                {report.type === "sauna" && (
                  <Icon
                    icon="mdi:sauna"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                )}
                {report.message}
              </Typography>

              {report.type === "maintenance" && (
                <IconButton onClick={toggleMaintenanceExpand} size="small">
                  {expandedMaintenance ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
            </Box>

            {report.type === "maintenance" && (
              <Collapse in={expandedMaintenance} timeout="auto" unmountOnExit>
                <List dense sx={{ mt: 1 }}>
                  {report.details.map((detail, idx) => (
                    <ListItem key={idx} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={detail.title} // Maintenance issue title
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              display="block"
                              sx={{ fontFamily: "Montserrat" }}
                            >
                              {detail.description} {/* Maintenance issue description */}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: "Montserrat" }}
                            >
                              Reported by {detail.reporter} on{" "}
                              {detail.date.toLocaleDateString()} {/* Reporter and date */}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1}
              sx={{ fontFamily: "Montserrat" }}
            >
              Status: {report.status}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default FacilityReport;