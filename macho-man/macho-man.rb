require 'optparse'

class MachO
	def initialize(bytes)
		@all_bytes = String.new bytes
		@header = MachOHeader.new(String.new bytes)
		bytes = bytes[@header.size..-1]
	end

	def to_s
		@header
	end
end

class MachOHeader
	def initialize(bytes)
		@magic = get_magic(bytes)
		if @magic.nil?
			raise Exception, "Input file desn't have a Mach-O header"
		end
		bytes = bytes[4..-1]

		@cputype = get_cputype(bytes)
		if !([:cpu_type_i386, :cpu_type_x86_64].include? @cputype)
			raise Exception, 'Input file is required to be CPU type i386 or x86_64 binary'
		end
		bytes = bytes[4..-1]

		# skip cpusubtype
		bytes = bytes[4..-1]

		@filetype = get_filetype(bytes)
		if !([:mh_execute].include? @filetype)
			raise Exception, 'Input file is required an executable Mach-O file'
		end
		bytes = bytes[4..-1]

		@ncmds, @sizeofcmds, @flags = bytes.unpack('LLL')
	end

	def size
		if [:mh_magic, :mh_cigam].include? @magic
			28
		else
			32
		end
	end

	def to_s
		"magic: #@magic\n"\
		"cputype: #@cputype\n"\
		"filetype: #@filetype"
	end

	private

	def get_magic(bytes)
		magic = bytes.unpack('L')[0]
		case magic
			when 0xfeedface then :mh_magic
			when 0xcefaedfe then :mh_cigam
			when 0xfeedfacf then :mh_magic_64
			when 0xcffaedfe then :mh_cigam_64
			else nil
		end
	end

	def get_cputype(bytes)
		cputype = bytes.unpack('L')[0]
		case cputype
			when 7 then :cpu_type_i386
			when 0x1000007 then :cpu_type_x86_64
			else nil
		end
	end

	def get_filetype(bytes)
		filetype = bytes.unpack('L')[0]
		case filetype
			when 2 then :mh_execute
			else nil
		end
	end
end


if __FILE__ == $0
	filename = ARGV.pop
	if filename.nil?
		puts 'usage: macho-man.rb <MachO file>'
		exit
	end

	bytes = IO.binread(filename)
	macho = MachO.new bytes
	puts macho.to_s
end





