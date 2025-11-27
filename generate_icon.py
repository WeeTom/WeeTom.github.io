import zlib
import struct

def make_png(width, height, color):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr = struct.pack('!I4sIIBBBBB', 13, b'IHDR', width, height, 8, 2, 0, 0, 0)
    ihdr += struct.pack('!I', zlib.crc32(ihdr))
    png += ihdr
    
    # IDAT chunk
    # content is: (1 byte filter type (0) + width * 3 bytes RGB) * height
    line = b'\x00' + struct.pack('BBB', *color) * width
    data = line * height
    compressed = zlib.compress(data)
    idat = struct.pack('!I4s', len(compressed), b'IDAT') + compressed
    idat += struct.pack('!I', zlib.crc32(idat))
    png += idat
    
    # IEND chunk
    iend = struct.pack('!I4s', 0, b'IEND')
    iend += struct.pack('!I', zlib.crc32(iend))
    png += iend
    
    return png

# Create a 512x512 blue icon
with open('icon.png', 'wb') as f:
    f.write(make_png(512, 512, (74, 144, 226))) # #4A90E2

