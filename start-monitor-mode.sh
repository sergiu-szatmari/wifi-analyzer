DEVICE=$1

if [ "$DEVICE" = "" ]; then
  DEVICE="wlo1"
fi

sudo airmon-ng check kill
sudo airmon-ng start $DEVICE
