import React from 'react';

import { Box, Button, Link, Tooltip } from '@chakra-ui/react';

// You can remove or change this section
export const Copyright: React.FC = React.memo(() => {
  return (
    <Box>
      <Tooltip label="Powered by React dApp Template (Vite) v0.5.2">
        <Button
          as={Link}
          href="https://nishara.me"
          isExternal
          variant="ghost"
          size="xs"
          color="gray"
          fontWeight="normal"
        >
          Created with ❤️ by stoXmod
        </Button>
      </Tooltip>
    </Box>
  );
});
