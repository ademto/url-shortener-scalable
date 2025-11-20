# AWS Deployment Guide - EC2, ALB, Auto Scaling

Complete step-by-step guide to deploy the URL shortener on AWS.

---

## Prerequisites

- AWS Account
- DynamoDB table created: `url-shortener-test`
- Basic understanding of AWS Console

---

## Phase 1: Create IAM Role for EC2

EC2 instances need permissions to access DynamoDB.

### Steps:

1. **Go to IAM Console** → Roles → Create role

2. **Select trusted entity:**
   - AWS service
   - Use case: EC2

3. **Add permissions:**
   - Search and select: `AmazonDynamoDBFullAccess`
   - (For production, use a custom policy with least privilege)

4. **Name the role:**
   - Role name: `url-shortener-ec2-role`
   - Description: "Allows EC2 to access DynamoDB"

5. **Create role**

---

## Phase 2: Create Security Groups

### 2.1 ALB Security Group

**Name:** `url-shortener-alb-sg`

**Inbound Rules:**
- Type: HTTP, Port: 80, Source: 0.0.0.0/0 (anywhere)
- Type: HTTPS, Port: 443, Source: 0.0.0.0/0 (optional, for SSL)

**Outbound Rules:**
- All traffic (default)

### 2.2 EC2 Security Group

**Name:** `url-shortener-ec2-sg`

**Inbound Rules:**
- Type: Custom TCP, Port: 3000, Source: `url-shortener-alb-sg` (ALB security group)
- Type: SSH, Port: 22, Source: Your IP (for debugging)

**Outbound Rules:**
- All traffic (default)

---

## Phase 3: Create Launch Template

Launch Template defines the EC2 instance configuration for Auto Scaling.

### Steps:

1. **Go to EC2 Console** → Launch Templates → Create launch template

2. **Template name:** `url-shortener-template`

3. **AMI:** Amazon Linux 2023 (or Amazon Linux 2)

4. **Instance type:** t2.micro (free tier) or t3.micro

5. **Key pair:** Select or create a key pair (for SSH access)

6. **Network settings:**
   - Security groups: Select `url-shortener-ec2-sg`

7. **Advanced details:**
   - **IAM instance profile:** `url-shortener-ec2-role`
   - **User data:** Copy contents from `user-data.sh`
     - **Important:** Update `BASE_URL` with your ALB DNS (you'll get this later)

8. **Create launch template**

---

## Phase 4: Create Target Group

Target Group defines how ALB routes traffic to EC2 instances.

### Steps:

1. **Go to EC2 Console** → Target Groups → Create target group

2. **Choose target type:** Instances

3. **Target group name:** `url-shortener-tg`

4. **Protocol:** HTTP, Port: 3000

5. **VPC:** Select your default VPC

6. **Health check settings:**
   - Protocol: HTTP
   - Path: `/health`
   - Healthy threshold: 2
   - Unhealthy threshold: 3
   - Timeout: 5 seconds
   - Interval: 30 seconds

7. **Create target group** (don't register targets yet)

---

## Phase 5: Create Application Load Balancer

### Steps:

1. **Go to EC2 Console** → Load Balancers → Create load balancer

2. **Select:** Application Load Balancer

3. **Name:** `url-shortener-alb`

4. **Scheme:** Internet-facing

5. **IP address type:** IPv4

6. **Network mapping:**
   - VPC: Default VPC
   - Availability Zones: Select at least 2 AZs (e.g., us-east-1a, us-east-1b)

7. **Security groups:** Select `url-shortener-alb-sg`

8. **Listeners:**
   - Protocol: HTTP, Port: 80
   - Default action: Forward to `url-shortener-tg`

9. **Create load balancer**

10. **Copy the ALB DNS name** (e.g., `url-shortener-alb-123456.us-east-1.elb.amazonaws.com`)

---

## Phase 6: Update User Data with ALB DNS

1. **Go back to Launch Template**
2. **Actions** → Modify template (Create new version)
3. **Update User Data:**
   - Replace `BASE_URL=http://your-alb-dns-name.us-east-1.elb.amazonaws.com`
   - With: `BASE_URL=http://url-shortener-alb-123456.us-east-1.elb.amazonaws.com`
4. **Create template version**
5. **Set as default version**

---

## Phase 7: Create Auto Scaling Group

### Steps:

1. **Go to EC2 Console** → Auto Scaling Groups → Create Auto Scaling group

2. **Name:** `url-shortener-asg`

3. **Launch template:** Select `url-shortener-template` (latest version)

4. **Network:**
   - VPC: Default VPC
   - Subnets: Select the same AZs as ALB (at least 2)

5. **Load balancing:**
   - Attach to existing load balancer
   - Choose from target groups: `url-shortener-tg`
   - Health check type: ELB
   - Health check grace period: 300 seconds

6. **Group size:**
   - Desired capacity: 2
   - Minimum capacity: 1
   - Maximum capacity: 5

7. **Scaling policies:**
   - Target tracking scaling policy
   - Metric: Average CPU utilization
   - Target value: 50%

8. **Create Auto Scaling group**

---

## Phase 8: Verify Deployment

### 8.1 Check EC2 Instances

1. Go to EC2 Console → Instances
2. You should see 2 instances launching
3. Wait for instances to pass health checks (~5 minutes)

### 8.2 Check Target Group

1. Go to Target Groups → `url-shortener-tg`
2. Targets tab → Should show 2 healthy instances

### 8.3 Test Application

1. **Copy ALB DNS:** `url-shortener-alb-123456.us-east-1.elb.amazonaws.com`
2. **Open in browser:** `http://url-shortener-alb-123456.us-east-1.elb.amazonaws.com`
3. **Test shortening a URL**
4. **Check health:** `http://url-shortener-alb-123456.us-east-1.elb.amazonaws.com/health`

---

## Troubleshooting

### Instances not healthy in Target Group

1. **SSH into instance:**
   ```bash
   ssh -i your-key.pem ec2-user@<instance-public-ip>
   ```

2. **Check user data logs:**
   ```bash
   sudo cat /var/log/user-data.log
   ```

3. **Check PM2 status:**
   ```bash
   pm2 status
   pm2 logs url-shortener
   ```

4. **Check if app is running:**
   ```bash
   curl http://localhost:3000/health
   ```

### Common Issues

**Issue:** User data script failed
- Check `/var/log/user-data.log` for errors
- Verify IAM role is attached to instance

**Issue:** App can't connect to DynamoDB
- Verify IAM role has DynamoDB permissions
- Check security group allows outbound traffic
- Verify table name matches: `url-shortener-test`

**Issue:** ALB returns 502/503
- Check target group health checks
- Verify EC2 security group allows traffic from ALB
- Check app is listening on port 3000

---

## Cost Estimate (us-east-1)

- **EC2 (2x t2.micro):** ~$16/month (free tier: $0 for 12 months)
- **ALB:** ~$16/month
- **DynamoDB (on-demand):** ~$1-5/month (depends on usage)
- **Data transfer:** Minimal for low traffic

**Total:** ~$33/month (or ~$17/month with free tier EC2)

---

## Next Steps

1. **Add custom domain** (Route 53)
2. **Enable HTTPS** (ACM + ALB listener)
3. **Set up CloudWatch alarms** for monitoring
4. **Configure CloudWatch Logs** for application logs
5. **Add WAF** for security (optional)
6. **Create AMI** from configured instance for faster launches

---

## Cleanup (To Avoid Charges)

1. Delete Auto Scaling Group
2. Delete Load Balancer
3. Delete Target Group
4. Delete Launch Template
5. Terminate any remaining EC2 instances
6. Delete DynamoDB table
7. Delete IAM role
8. Delete Security Groups
