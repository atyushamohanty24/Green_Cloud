resource "aws_iam_role" "greencloud_executor_role" {
  name = "GreenCloudAutomationExecutorRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "greencloud_least_privilege" {
  name        = "GreenCloudLeastPrivilegeOptimizationPolicy"
  description = "Least privilege permissions for rightsizing and CloudWatch metrics sampling"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:GetMetricData",
          "cloudwatch:GetMetricStatistics",
          "ec2:DescribeInstances",
          "ec2:ModifyInstanceAttribute",
          "rds:DescribeDBInstances",
          "s3:GetBucketLifecycleConfiguration",
          "s3:PutLifecycleConfiguration"
        ]
        Resource = "*"
      }
    ]
  })
}
