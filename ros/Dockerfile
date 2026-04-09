FROM ros:humble-ros-base

RUN apt-get update && apt-get install -y \
    ros-humble-turtlebot3* \
    ros-humble-navigation2 \
    ros-humble-nav2-bringup \
    ros-humble-rosbridge-server \
    ros-humble-foxglove-bridge \
    ros-humble-rmw-cyclonedds-cpp \
    ros-humble-gazebo-ros \
    ros-humble-gazebo-plugins \
    ros-humble-gazebo-ros-pkgs \
    && rm -rf /var/lib/apt/lists/*

ENV TURTLEBOT3_MODEL=burger
ENV RMW_IMPLEMENTATION=rmw_cyclonedds_cpp

RUN echo "source /opt/ros/humble/setup.bash" >> /root/.bashrc