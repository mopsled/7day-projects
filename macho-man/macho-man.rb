require 'optparse'

class MachO
	def initialize(bytes)
		@bytes = bytes

		@magic = get_magic(@bytes)
		if @magic.nil?
			raise ArgumentError, "Input bytes don't have a MachO magic header"
		end
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
end


if __FILE__ == $0
	filename = ARGV.pop
	if filename.nil?
		puts 'usage: macho-man.rb <MachO file>'
		exit
	end

	bytes = IO.binread(filename)
	macho = MachO.new bytes
end





