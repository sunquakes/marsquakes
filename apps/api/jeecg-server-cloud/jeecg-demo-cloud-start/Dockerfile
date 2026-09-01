FROM registry.cn-hangzhou.aliyuncs.com/dockerhub_mirror/java:17-anolis

MAINTAINER jeecgos@163.com

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# The slim linuxkit image strips locales, which garbles CJK output; java:17-anolis is anolis based (CentOS/RHEL family), so use yum
RUN yum install -y --setopt=tsflags=nodocs \
        glibc-langpack-en \
        glibc-common \
    && yum clean all

ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"

RUN mkdir -p /jeecg-demo-cloud

WORKDIR /jeecg-demo-cloud

EXPOSE 7002

ADD ./target/jeecg-demo-cloud-start-3.9.3.jar ./

CMD sleep 60 && exec java -Djava.security.egd=file:/dev/./urandom -jar jeecg-demo-cloud-start-3.9.3.jar
