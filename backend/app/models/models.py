from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="operator")  # admin, operator, viewer

class CloudResource(Base):
    __tablename__ = "cloud_resources"
    
    id = Column(String, primary_key=True, index=True)  # e.g., i-0a82b3c14f91e
    name = Column(String, nullable=False)
    service_type = Column(String, nullable=False)  # EC2, RDS, S3, Lambda
    region = Column(String, nullable=False)
    instance_type = Column(String, nullable=False)
    status = Column(String, default="running")  # running, stopped, resized, optimized
    hourly_cost = Column(Float, default=0.0)
    carbon_footprint_hourly = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    metrics = relationship("Metric", back_populates="resource", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="resource", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="resource", cascade="all, delete-orphan")

class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, ForeignKey("cloud_resources.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    cpu_utilization = Column(Float, default=0.0)
    memory_utilization = Column(Float, default=0.0)
    network_in_kb = Column(Float, default=0.0)
    network_out_kb = Column(Float, default=0.0)
    request_count = Column(Float, default=0.0)
    storage_used_gb = Column(Float, default=0.0)

    resource = relationship("CloudResource", back_populates="metrics")

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, ForeignKey("cloud_resources.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    predicted_demand = Column(String, nullable=False)  # Low, Medium, High, Very High
    confidence_score = Column(Float, default=0.0)
    predicted_cpu = Column(Float, default=0.0)

    resource = relationship("CloudResource", back_populates="predictions")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, ForeignKey("cloud_resources.id"), nullable=False, index=True)
    recommendation_type = Column(String, nullable=False)  # Rightsize, Stop Idle, Storage Lifecycle, Scale Down
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    current_spec = Column(String, nullable=False)
    target_spec = Column(String, nullable=False)
    estimated_savings_monthly = Column(Float, default=0.0)  # ESTIMATED
    estimated_carbon_reduction_monthly = Column(Float, default=0.0)  # ESTIMATED
    risk_level = Column(String, default="Low")  # Low, High
    status = Column(String, default="Pending")  # Pending, Approved, Rejected, Executed, Rolled Back
    created_at = Column(DateTime, default=datetime.utcnow)

    resource = relationship("CloudResource", back_populates="recommendations")
    actions = relationship("Action", back_populates="recommendation")

class Action(Base):
    __tablename__ = "actions"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=False)
    resource_id = Column(String, ForeignKey("cloud_resources.id"), nullable=False)
    user_role = Column(String, nullable=False)  # admin, system_auto
    action_type = Column(String, nullable=False)
    before_snapshot = Column(JSON, nullable=True)
    after_snapshot = Column(JSON, nullable=True)
    status = Column(String, default="Success")  # Success, Failed, Rolled Back
    executed_at = Column(DateTime, default=datetime.utcnow)

    recommendation = relationship("Recommendation", back_populates="actions")

class CarbonData(Base):
    __tablename__ = "carbon_data"
    
    id = Column(Integer, primary_key=True, index=True)
    region = Column(String, nullable=False, index=True)
    carbon_intensity_g_co2_kwh = Column(Float, default=0.0)
    grid_cleanliness_pct = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    recommendation_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
