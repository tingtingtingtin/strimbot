FROM ros:humble-ros-base

RUN apt-get update && apt-get install -y \
    ros-humble-turtlebot3-bringup \
    ros-humble-turtlebot3-simulations \
    ros-humble-gazebo-ros-pkgs \
    ros-humble-rosbridge-server \
    ros-humble-rmw-cyclonedds-cpp \
    && rm -rf /var/lib/apt/lists/*

ENV TURTLEBOT3_MODEL=burger
ENV RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
ENV GAZEBO_MODEL_PATH=/opt/ros/humble/share/turtlebot3_gazebo/models

COPY turtlebot3_world.launch.py /opt/ros/humble/share/turtlebot3_gazebo/launch/turtlebot3_world.launch.py

RUN echo "source /opt/ros/humble/setup.bash" >> /root/.bashrc