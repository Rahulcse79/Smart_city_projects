// DashboardCard.js
import React from 'react';
import Card from 'react-bootstrap/Card';

const DashboardCard = ({ title, value, change, icon, color }) => {
  return (
    <Card className="dashboard-card" style={{ borderColor: color }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          <div className="value" style={{ color }}>{value}</div>
          <div className="change">{change}</div>
        </Card.Text>
        <div className="icon" style={{ color }}>{icon}</div>
      </Card.Body>
    </Card>
  );
};

export default DashboardCard;
