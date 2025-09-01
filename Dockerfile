FROM alpine:3.20
RUN adduser -D -H -s /sbin/nologin app &&     echo 'WorkBuoy backend placeholder' > /app.txt
USER app
CMD ["sh","-c","sleep 3600"]
