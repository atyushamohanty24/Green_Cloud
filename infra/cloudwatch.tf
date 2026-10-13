resource "aws_cloudwatch_metric_alarm" "ec2_underutilized_alarm" {
  alarm_name          = "greencloud-ec2-underutilized-cpu"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 168 # 7 days of hourly evaluations
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 3600
  statistic           = "Average"
  threshold           = 15.0
  alarm_description   = "Triggers GreenCloud AI optimization scan when EC2 average CPU falls below 15%"
}
