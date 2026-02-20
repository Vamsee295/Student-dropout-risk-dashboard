"""Tests for the RiskModel service logic."""

import pytest
from app.services.risk_model import RiskModel, ModelVersionManager
from app.models import RiskLevel, RiskTrend


class TestRiskLevelClassification:
    """Verify score → risk level mapping boundaries."""

    @pytest.mark.parametrize("score,expected", [
        (0, RiskLevel.SAFE),
        (20, RiskLevel.SAFE),
        (40, RiskLevel.SAFE),
        (41, RiskLevel.STABLE),
        (55, RiskLevel.STABLE),
        (56, RiskLevel.MODERATE),
        (70, RiskLevel.MODERATE),
        (71, RiskLevel.HIGH),
        (85, RiskLevel.HIGH),
        (100, RiskLevel.HIGH),
    ])
    def test_risk_level_boundaries(self, score, expected):
        assert RiskModel._get_risk_level(score) == expected


class TestRiskTrendCalculation:
    def test_first_prediction_is_stable(self):
        trend, value = RiskModel.calculate_risk_trend(45.0, None)
        assert trend == RiskTrend.STABLE
        assert value == "Stable"

    def test_increase_above_threshold(self):
        trend, value = RiskModel.calculate_risk_trend(60.0, 50.0)
        assert trend == RiskTrend.UP
        assert "+" in value

    def test_decrease_below_threshold(self):
        trend, value = RiskModel.calculate_risk_trend(40.0, 55.0)
        assert trend == RiskTrend.DOWN
        assert "-" in value

    def test_small_change_is_stable(self):
        trend, value = RiskModel.calculate_risk_trend(50.0, 49.0)
        assert trend == RiskTrend.STABLE
        assert value == "Stable"


class TestAlertDetection:
    def test_alert_triggered_on_large_increase(self):
        assert RiskModel.detect_alert(80.0, 60.0) is True

    def test_no_alert_on_small_increase(self):
        assert RiskModel.detect_alert(65.0, 60.0) is False

    def test_no_alert_on_first_prediction(self):
        assert RiskModel.detect_alert(90.0, None) is False

    def test_no_alert_on_decrease(self):
        assert RiskModel.detect_alert(40.0, 70.0) is False


class TestRiskValueFormatting:
    def test_safe_format(self):
        value = RiskModel._format_risk_value(30.0, RiskLevel.SAFE)
        assert value == "Stable"

    def test_stable_format(self):
        value = RiskModel._format_risk_value(50.0, RiskLevel.STABLE)
        assert value == "Stable"

    def test_high_risk_format(self):
        value = RiskModel._format_risk_value(80.0, RiskLevel.HIGH)
        assert "80% Risk" in value

    def test_moderate_format(self):
        value = RiskModel._format_risk_value(65.0, RiskLevel.MODERATE)
        assert "65% Risk" in value


class TestModelVersionManager:
    def test_promote_when_better(self):
        assert ModelVersionManager.should_promote_model(0.92, 0.88) is True

    def test_no_promote_when_worse(self):
        assert ModelVersionManager.should_promote_model(0.85, 0.90) is False

    def test_no_promote_when_equal(self):
        assert ModelVersionManager.should_promote_model(0.88, 0.88) is False

    def test_drift_detection_no_drift(self):
        current = {"attendance_rate": 80.0, "engagement_score": 70.0}
        historical = {"attendance_rate": 82.0, "engagement_score": 68.0}
        drift = ModelVersionManager.detect_feature_drift(current, historical, threshold=0.20)
        assert not any(drift.values())

    def test_drift_detection_with_drift(self):
        current = {"attendance_rate": 50.0}
        historical = {"attendance_rate": 80.0}
        drift = ModelVersionManager.detect_feature_drift(current, historical, threshold=0.20)
        assert drift["attendance_rate"] is True
