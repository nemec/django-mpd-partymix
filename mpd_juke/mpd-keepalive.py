import sys; sys.path.insert(0, "/home/dan/prg/src/python-mpd2")

import random
import mpd
import gobject
import threading
import argparse


gobject.threads_init()


class MPDKeepalive(object):

  def __init__(self, host, port):
    self.client = mpd.MPDClient(use_unicode=True)
    self.client.connect(host, port)
    
    self.client.consume(1)
    self.client.random(0)
    
    self.client.send_idle()
    gobject.io_add_watch(self.client, gobject.IO_IN, self._idle_callback)

  def get_random_song(self):
    return random.choice(self.client.list('file'))

  def playlist_empty(self):
    return int(self.client.status()['playlistlength']) == 0

  def _idle_callback(self, client, condition):
    changes = client.fetch_idle()
    
    # If empty, play a random song
    if "playlist" in changes and self.playlist_empty():
      client.add(self.get_random_song())
      client.play(0)
    client.send_idle()
    return True

  def main(self):
    try:
      gobject.MainLoop().run()
    except KeyboardInterrupt:
      self.client.fetch_idle()
      self.client.consume(False)


if __name__ == "__main__":
  keepalive = MPDKeepalive("tails.local", 6600)
  keepalive.main()
