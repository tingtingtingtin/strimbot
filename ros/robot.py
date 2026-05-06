import rclpy
from rclpy.node import Node
from nav_msgs.msg import Odometry
from geometry_msgs.msg import Twist
import math

class Robot(Node):
    def __init__(self):
        super().__init__('robot')
        self.odom_pub = self.create_publisher(Odometry, '/odom', 10)
        self.cmd_sub = self.create_subscription(Twist, '/cmd_vel', self.cmd_cb, 10)
        self.timer = self.create_timer(0.05, self.update)
        self.x = 0.0
        self.y = 0.0
        self.theta = 0.0
        self.linear = 0.0
        self.angular = 0.0

    def cmd_cb(self, msg):
        self.linear = msg.linear.x
        self.angular = msg.angular.z

    def update(self):
        dt = 0.05
        self.theta += self.angular * dt
        self.x += self.linear * math.cos(self.theta) * dt
        self.y += self.linear * math.sin(self.theta) * dt

        msg = Odometry()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'odom'
        msg.pose.pose.position.x = self.x
        msg.pose.pose.position.y = self.y
        msg.pose.pose.orientation.z = math.sin(self.theta / 2)
        msg.pose.pose.orientation.w = math.cos(self.theta / 2)
        msg.twist.twist.linear.x = self.linear
        msg.twist.twist.angular.z = self.angular
        self.odom_pub.publish(msg)

def main():
    rclpy.init()
    rclpy.spin(Robot())

if __name__ == '__main__':
    main()