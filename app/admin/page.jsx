"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Button,
  CircularProgress,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Divider,
} from "@mui/material";
import axios from "axios";

export default function AdminTripPage() {
  const tripId = "689a0dbbc2b8c727b6a9c2c1";
  const API_BASE = "http://localhost:5000/api/trips";

  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch data
  useEffect(() => {
    axios
      .get(`${API_BASE}/${tripId}`)
      .then((res) => {
        setTripData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Save data
  const handleSave = () => {
    setSaving(true);
    axios
      .put(`${API_BASE}/${tripId}`, tripData)
      .then(() => {
        alert("Trip updated successfully!");
        setSaving(false);
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
      });
  };

  if (loading) return <CircularProgress />;

  // Helper to update state
  const updateField = (path, value) => {
    const updated = { ...tripData };
    let obj = updated;
    const keys = path.split(".");
    keys.slice(0, -1).forEach((k) => {
      obj = obj[k];
    });
    obj[keys[keys.length - 1]] = value;
    setTripData(updated);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel - {tripData.title}
      </Typography>

      {/* Trip Overview */}
      <Typography variant="h6" gutterBottom>Trip Overview</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            label="Location"
            value={tripData.destination.name}
            fullWidth
            onChange={(e) =>
              updateField("destination.name", e.target.value)
            }
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            type="number"
            label="Days"
            value={tripData.numberOfDays}
            fullWidth
            onChange={(e) => updateField("numberOfDays", Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            select
            label="Budget"
            value={tripData.budget}
            fullWidth
            onChange={(e) => updateField("budget", e.target.value)}
          >
            {["Low", "Moderate", "High"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Hotels */}
      <Typography variant="h6" gutterBottom>Hotels</Typography>
      {tripData.hotels.map((hotel, i) => (
        <Grid container spacing={2} sx={{ mb: 1 }} key={i}>
          <Grid item xs={3}>
            <TextField
              label="Hotel Name"
              value={hotel.name}
              onChange={(e) =>
                updateField(`hotels.${i}.name`, e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Address"
              value={hotel.address}
              onChange={(e) =>
                updateField(`hotels.${i}.address`, e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="Price"
              type="number"
              value={hotel.price.amount}
              onChange={(e) =>
                updateField(`hotels.${i}.price.amount`, Number(e.target.value))
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              label="Rating"
              type="number"
              value={hotel.rating}
              onChange={(e) =>
                updateField(`hotels.${i}.rating`, Number(e.target.value))
              }
              fullWidth
            />
          </Grid>
        </Grid>
      ))}

      <Divider sx={{ my: 3 }} />

      {/* Daily Itinerary */}
      <Typography variant="h6" gutterBottom>Daily Itinerary</Typography>
      {tripData.itinerary.map((day, dayIndex) => (
        <div key={dayIndex} style={{ marginBottom: "2rem" }}>
          <Typography variant="subtitle1">
            Day {day.dayNumber} - {day.theme}
          </Typography>
          {day.activities.map((act, actIndex) => (
            <Grid container spacing={2} sx={{ mb: 1 }} key={actIndex}>
              <Grid item xs={4}>
                <TextField
                  label="Activity Title"
                  value={act.title}
                  fullWidth
                  onChange={(e) =>
                    updateField(
                      `itinerary.${dayIndex}.activities.${actIndex}.title`,
                      e.target.value
                    )
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Description"
                  value={act.description}
                  fullWidth
                  onChange={(e) =>
                    updateField(
                      `itinerary.${dayIndex}.activities.${actIndex}.description`,
                      e.target.value
                    )
                  }
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Priority"
                  value={act.priority}
                  fullWidth
                  onChange={(e) =>
                    updateField(
                      `itinerary.${dayIndex}.activities.${actIndex}.priority`,
                      e.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          ))}
        </div>
      ))}

      <Divider sx={{ my: 3 }} />

      {/* Budget */}
      <Typography variant="h6" gutterBottom>Budget Breakdown</Typography>
      {Object.entries(tripData.budgetBreakdown.categories).map(([cat, value], i) => (
        <Grid container spacing={2} sx={{ mb: 1 }} key={i}>
          <Grid item xs={6}>
            <Typography>{cat}</Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="number"
              value={value}
              onChange={(e) =>
                updateField(`budgetBreakdown.categories.${cat}`, Number(e.target.value))
              }
              fullWidth
            />
          </Grid>
        </Grid>
      ))}

      <Divider sx={{ my: 3 }} />

      {/* Notes & Tags */}
      <Typography variant="h6" gutterBottom>Notes & Tags</Typography>
      <TextField
        label="Notes"
        value={tripData.notes}
        onChange={(e) => updateField("notes", e.target.value)}
        fullWidth
        multiline
        minRows={3}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Tags (comma separated)"
        value={tripData.tags.join(", ")}
        onChange={(e) =>
          updateField(
            "tags",
            e.target.value.split(",").map((t) => t.trim())
          )
        }
        fullWidth
      />

      <Divider sx={{ my: 3 }} />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </Container>
  );
}
