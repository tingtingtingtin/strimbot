FROM osrf/ros:humble-desktop

RUN apt-get update && apt-get install -y \
    ros-humble-turtlebot3* \
    ros-humble-rosbridge-server \
    ros-humble-rmw-cyclonedds-cpp \
    && rm -rf /var/lib/apt/lists/*

ENV TURTLEBOT3_MODEL=burger
ENV RMW_IMPLEMENTATION=rmw_cyclonedds_cpp

RUN echo "source /opt/ros/humble/setup.bash" >> /root/.bashrc